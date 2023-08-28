---
layout: post
categories: tech
title: How to tune Semian's Bulkheads
tags: semian, bulkhead, resilience, nr-architect
published: false
---

Feedback
- Tracy
	- Protecting our service vs protecting downstreams
	- Isolating more than just resources, whole threads
	- What would semian look like if it was 1 page of pseudo-code
	- How does this work with Puma (or threads)?
	- How does this work with pools?
	- How could this be done with metrics instead of custom events?
- David Howell
	- Did lots of Hystrix back in 2015
- Noah
  - Ditch the icons
  - Renumber the services/dbs
  - Change the title on the first image
  - Circuit breaker should be attached to the arrow, ditch the little API Client knob (at least until the circuit breakers are introduced)

Topics I want to cover
- Protecting our service vs protecting downstreams
- Lowering timeouts
- How bulkheads and circuit breakers interact

## Introduction
Building resilient and fault-tolerant web applications is... challenging. And the more connections your service has, the worse it gets.

In this article, we will
1. Explore the Bulkhead pattern and work our way through an example to understanding _why_ it would be necessary in the first place.
2. Discuss how to tune Bulkheads using historical data output by Semian (or a similar system)
3. And lastly, I will share our team's experience tuning bulkheads and sharing lessons learned and some pitfalls to avoid.
## 1. The Bulkhead Pattern
The Bulkhead pattern takes inspiration from the practice of dividing a ship into multiple, watertight compartments. In the context of software, the Bulkhead pattern works by segmenting systems, components, or resources into isolated partitions or "bulkheads," ensuring that a problem in one does not cascade into the others.

In this case, we're talking about isolating connections to databases or external services.
### A simple system we can use to explore this problem domain

![Initial system diagram with a customer computer on the left, a double sided arrow to a box titled 'Our service'. Attached to the right side of 'Our Service' are three small boxes indicating API or DB clients, each with an arrow to an external service or database. There are two services, Service B and Service C, and one database. All of the boxes are white](/images/posts/basic_system.png "Initial system diagram with a customer computer on the left, a double sided arrow to a box titled 'Our service'. Attached to the right side of 'Our Service' are three small boxes indicating API or DB clients, each with an arrow to an external service or database. There are two services, Service B and Service C, and one database. All of the boxes are white")
For the purposes of this article, let's use the above system diagram. We've got a service with connections to 2 other services and 1 database. None of the databases or services are accessible locally; they're only accessible over the network. We can also assume that some basic server-side resilience mechanisms are in place, like sending back 503 status codes, network timeouts, etc.

Let's further assume that we're using a web server that has 6 processes with 5 threads each (I'll call these "workers" in the article), fronted by some sort of load balancer like nginx. For now, there is no connection pooling in the clients.

Additionally, each service or database has some sort of client library used to connect to the resource. Maybe they're fancy and integrated clients, like a database ORM, but they're clients all the same. And even though it's rarely so nice in reality, let's pretend for one blissful moment that we control and understand all the code in our service.
### How service failures affect this system

![The same system diagram, but this time Service C is red, the line connecting it to 'Our Service' is red and the line is subtitled 'Fast failure'. Our service is red and the arrow to the customer computer is red. There is a red box at the bottom which says 'Service degrades and sends 5xx responses or server timeouts depending on the failure'](/images/posts/no_cb_fast_failure.png "The same system diagram, but this time Service C is red, the line connecting it to 'Our Service' is red and the line is subtitled 'Fast failure'. Our service is red and the arrow to the customer computer is red. There is a red box at the bottom which says 'Service degrades and sends 5xx responses or server timeouts depending on the failure'")
Inevitably, there will come a time when one of the services or the database goes down. And unfortunately, the more connections there are, the more frequently this happens.

Even though our fictitious client libraries don't have resilience mechanisms built in, we _do_ have some server-side mechanisms to encourage clients to cool off for a bit, like the "503 Service Unavailable" response code. And we can assume that our customers have _some_ resilience mechanisms in place if we do send back 503s.

So at least customers know when there are problems, but the issue is that _some_ of the site _is_ available and working, so it would be nice if those other parts of the site would still work.

Let's do better!
#### Adding in circuit breakers so we can fail quickly
![Same system diagram, but even though Service C is red and its arrow still says 'Fast failure', the box marked'Our service' is green and the API Client attached to Service C is also green. There is a box at the bottom that says 'Circuit breaker trips quickly'.](/images/posts/cb_fast_failure.png "Same system diagram, but even though Service C is red and its arrow still says 'Fast failure', the box marked'Our service' is green and the API Client attached to Service C is also green. There is a box at the bottom that says 'Circuit breaker trips quickly'.")
Understandably, we would like to provide a better experience to our customers. Being the enterprising individuals we are, we do some research and come across the concept of Circuit Breakers. We decide on a library, start to wrap all of our connections in those, and life seems to be instantaneously better. We all get raises and extra vacation time!

Nah, not really. Nothing is that easy right? But it does help a ton.

With the circuit breakers in place, when a service fails completely, our circuit breakers *usually*  notice the problem pretty quickly and throw an exception any time a new request attempts to access a struggling resource for a configured time period (30 seconds).

When that 30 seconds is up, the circuit breaker allows a few connections to be made and watches to see how it goes. When the system sees a pre-configured number of successes, the circuit "closes" and traffic is allowed to flow again.

For quick failures, this is exactly right.
#### But circuit breakers don't work for slow failures

![The same system diagram, but everything is red again. This time the line between Service C and the API Client says 'Slow failure'. The box at the bottom says 'Circuit breaker never sees an error rate high enough to trip'.](/images/posts/cb_slow_connections.png "The same system diagram, but everything is red again. This time the line between Service C and the API Client says 'Slow failure'. The box at the bottom says 'Circuit breaker never sees an error rate high enough to trip'.")
Most circuit breakers are configured to trip when they rescue X exceptions in Y seconds. For us, we (still) use 5 errors in 30 seconds for most of our connections. But what if each error takes longer than 6 seconds?

You might be saying to yourself, "6 seconds is a weirdly specific number Chuck; where did that come from?"

I'm glad you asked! Let me explain: for a moment, pretend that you're a single thread. If you see 5 errors arrive one after another, and each one takes 7 seconds to arrive, that's 35 seconds. Our circuit breaker is configured to only trip if 5 errors happen in 30 seconds. But in this case, only 4 of the errors arrived in the first 30 seconds, so the circuit won't open.

So what to do about this. One answer is to ensure that these connections *aren't allowed to exceed 6 seconds*. So we can configure our API client to timeout after 6 seconds. Success right?

That will almost certainly prevent this particular problem, but if there are customers that need longer connections, it's not really an option.

Also, you need to be **extremely** cautious about monitoring this or you may find out that while your *average* is 200ms, some percentage of your traffic takes *longer* than 6 seconds. Without the timeout the service might be perfectly able to service all of those requests, but with it configured to cut off at 6 seconds, **all of that traffic gets cut off** even if it could have succeeded.

**This is a fundamental problem: the circuit breaker pattern works when the errors are fast, but not when they're slow.**

I have looked and researched a lot, I do not believe there is a way around this with what we have available in a single thread. *We need coordination between threads in order to do better.*

### Bulkheads turn slow failures into fast failures

![The same system diagram, the arrow from Service C still says 'Slow failure', but this time the API Client has a little boat icon and the box labeled 'Our service' is green. The text at the bottom says 'Bulkheads raise exceptions allowing circuit breakers to trip quickly'.](/images/posts/cb_and_bulkhead_slow_connections.png "The same system diagram, the arrow from Service C still says 'Slow failure', but this time the API Client has a little boat icon and the box labeled 'Our service' is green. The text at the bottom says 'Bulkheads raise exceptions allowing circuit breakers to trip quickly'.")
Circuit breakers are good at fast failures, but we need something *more*. There are actually a lot of solutions to this, but the one I'd like to present is the Bulkhead pattern (as presented in Semian).

The idea behind Semian's bulkheads is to:
* Track the number of open and active network requests for some external resource
* Track that number for all workers on a machine
* Throw an exception if there are too many open connections to any particular resource

In order to do that, Semian puts a counter on the machine (*outside* of the ruby process), which all of the workers can check in with when they wanted to make a new connection (nerd detail: it uses a "non-sleeping SysV Semaphore" if you're curious). Each time a connection is made, first the worker tries to decrease the counter by one, then when it's done with the connection it increases the counter by one.

During normal operations, the counter should not reach 0. If the counter reaches zero, Semian throws an _immediate_ exception, which a circuit breaker can catch. Because the exception is thrown *before* the network call is made, the whole process is extremely fast, which means a single thread can easily chew through lots of requests and achieve the "X errors in Y seconds" needed to trip a circuit breaker.

Semian's bulkheads use these counters to track how many concurrent connections are open to a resource at any given time, and limit those connections to a pre-configured amount.

### But why do Bulkheads help?!

TODO: This needs an image

Okay, that's a fair question. You know how they work, but not _why_. It all comes down to this fairly obvious statement: if a service takes longer to process requests, more requests will stack up and more customers will be unhappy. But the correlation is important and *non-obvious*: **if we can observe the number of pending requests to a particular resource, we can infer whether it's operating normally or not.**

Let's explore an example: If we know that our service usually has less than 6 open connections to Service C. If our service tries to make a 7th connection, we can infer that Service C must be moving more slowly than usual.

That probably seems pretty weak. Let's go farther and say that over the last 6 weeks, we have _never_ seen our service make more 7 connections to Service C (outside of outages). Now it probably feels a little different to you; if our service tries to make that 7th connection, we _know_ something is suspicious.

So that's why Semian throws an exception when a new connection is made above that pre-configured level; it _knows_ that something is exceptional, and in this case, the best way to handle that is to give that resource some time to catch up by stopping new requests from asking for that resource.

### Summary of Bulkheads

Let's go over this again really quick:
- Circuit breakers wrap our connections and trip when they see X errors in Y seconds.
	- These work great for **fast** errors where you can see hundreds per second.
	- Circuit breakers never trip for slow failures.
- Bulkheads wrap our connections and limit how many workers on this machine can access a specific resource (like a database or another service).
	- When a resource is particularly slow, more workers will end up waiting on that connection.
	- If we exceed that allowed number of connections, bulkheads will throw an exception and they can throw them **very fast**.
- Bulkheads make slow connections into fast failures if there are an unexpected number of them being made.
- Circuit breakers can then catch these fast failures and stop requests from even trying for a pre-defined amount of time.

## 2. Finding the right numbers for Bulkheads

Now we get to the fun part and honestly, the place where I caused the most incidents: finding the right numbers for the bulkheads.

Let's rephrase the thing we need and get really specific:
1. We need to know the number of concurrent connections that our service makes to each resource.
2. We need to know the maximum concurrency number for each resource over the last n days (outside of incidents or other weirdness).
3. We would really _like_ to know the concurrency values that clearly indicate a slow failure in each resource, but outside of causing incidents ourselves, that's sorta hard to get sometimes.

To do this, my team inserted a custom event into NRDB every time we made a connection to one of these resources. That event contains the resource name, the current concurrency number, and the current limit. This is expensive and I'd like to figure out a way to do it with Metrics, but until I figure that out and update this doc, I would recommend toggling this on only when you want to tune or observe things.

Semian is kind enough to give us a callback that we can hook into. This callback fires every time Semian connects to _any_ kind of supported resource.

```ruby
# config/initializers/semian_init.rb
if defined?(Semian)
  Semian.subscribe do |event, resource, scope, adapter, payload|
    bulkhead = resource.respond_to?(:bulkhead) && resource.bulkhead
    semian_event = {
      resource:    resource.name,
      tickets:     bulkhead && bulkhead.tickets,
      count:       bulkhead && bulkhead.count,
      workers:     bulkhead && bulkhead.registered_workers,
      event:       event,
      adapter:     adapter
      # Because this is going through the NewRelic::Agent, we will also get `appName`, `host`, and a couple other helpful things.
    }
    NewRelic::Agent.record_custom_event('SemianEvent', semian_event)
  end
end
```

This will output a whole load of events that look like this (I'll talk about tickets vs count in a bit):

|App Name|Host|Resource|Tickets|Count|Workers| Event | Adapter |
|---|---|---|---|---|---|---|---|
|RPM API Production|api-grape-5fcbf68bcb-cgp74|nethttp_summary-record-service.vip.cf.nr-ops.net_80|15|14|30|success|http|87.3k|
|RPM API Production|api-grape-5fcbf68bcb-cgp74|nethttp_summary-record-service.vip.cf.nr-ops.net_80|15|13|30|success|http|84.3k|
|RPM API Production|api-grape-5fcbf68bcb-cgp74|nethttp_summary-record-service.vip.cf.nr-ops.net_80|15|12|30|success|http|82k|

Using this data, we could plot a chart and try to figure out the maximum number of connections that are normally made for each host. But it's a mess and it's not very helpful.

![This shows a very colorful chart with many, many lines. It has a giant label on it that says 'This is an unhelpful mess'. Each line is meant to represent the highest number of connections to a resource for a particular host.](/images/posts/unhelpful_mess.png "This shows a very colorful chart with many, many lines. It has a giant label on it that says 'This is an unhelpful mess'. Each line is meant to represent the highest number of connections to a resource for a particular host.")

The query I used to produce this is:
```sql
SELECT max(tickets - count) AS 'Current connections'
FROM SemianEvent
WHERE adapter = 'http'
AND event NOT LIKE 'success'
AND appName = 'RPM API Production'
FACET host
TIMESERIES MAX
LIMIT 50
```

What we need is to find some single number which clumps all of these different lines together. That's where `percentile()` comes in. If we calculate the 99th percentile of all those lines, we get "The minimum number that exceeds 99% of all numbers in this chart" (regardless of which host they're on).

![This chart is labeled 'Connection count' and has a single wiggly line that is mostly hovering between 4 and 6. There is a spike on the left side that hits 15 labeled 'This is the max()', and a big hump in the middle labeled 'This is weird, but okay'. Under the whole line at about 5 is a line labeled 'This is the baseline'.](/images/posts/this_is_the_max.png "This chart is labeled 'Connection count' and has a single wiggly line that is mostly hovering between 4 and 6. There is a spike on the left side that hits 15 labeled 'This is the max()', and a big hump in the middle labeled 'This is weird, but okay'. Under the whole line at about 5 is a line labeled 'This is the baseline'.")

To get this chart, this is the NRQL that I used:

```sql
SELECT
  max(tickets - count) AS 'Max connections',
  percentile(tickets - count, 99) AS 'Percentile connections'
FROM SemianEvent
WHERE adapter = 'http'
AND appName = 'RPM API Production')
TIMESERIES MAX
LIMIT MAX
```

We have the max connections for any host in any individual minute, but we need to know the maximum concurrency _over some **typical** time period_. It needs to be over some time period, but it's not enough to get the maximum over the last month if there was an incident in the middle that would skew our numbers. We need the maximum **typical** number, some baseline above which we have pretty high confidence that things are broken.

There are two specific parts of the chart above that are worrisome to me. The spike on the left is clearly abnormal, but we were clearly able to resolve it. The hump in the middle is also unusual, but it's unclear whether it's incident-ish. So probably we need to avoid both of those time ranges and only look at the time period to the right of the hump. In order to do that, I'll click and drag on the chart or change the time range to select only the bits that seem pretty normal.

**Caution**: Be careful to not accidentally select the weekend or midnight. Those may be calm times, but you don't want to drop all traffic that exceeds your weekend peak!

![A similar chart to above titled 'Connection count', but this time there are no big spikes or humps. The values are between 5 and 9.](/images/posts/baseline_bulkhead_numbers.png "A similar chart to above titled 'Connection count', but this time there are no big spikes or humps. The values are between 5 and 9.")

Now we have a nice baseline chart, it's time to turn it into a single number.

Using the same chart from above, we'll edit the query and remove the timeseries:

![A text widget showing 6 numbers, each labeled 'Open connections' followed by 99%, 99.9%, and so on. The 99th percentile number reads '8.063'.](/images/posts/bulkhead_max_connections_without_timeseries.png "A text widget showing 6 numbers, each labeled 'Open connections' followed by 99%, 99.9%, and so on. The 99th percentile number reads '8.063'.")

```sql
SELECT
  average(tickets - count) AS 'Average open connections',
  percentile(tickets - count, 95, 99, 99.9, 99.99, 99.999) AS 'Open connections'
FROM SemianEvent
WHERE adapter = 'http'
AND appName = 'RPM API Production'
```

The chart above only showed the 99th percentile, which if you squint, looked a bit like 8 or 9ish. (PS. I have no idea why there's a decimal after the number, but try to ignore it)

So to state what the 99th percentile does again, we're looking for "the minimum number that exceeds 99% of the numbers on this chart" (regardless of what minute they appear in). Importantly, if we included the blue spike in our time range, the percentile number will have to be greater than 15-ish. But the baseline is so much smaller, it feels suspicious to set it that high.

![Zooming back out to the original timeseries chart, we see a wiggly line with a hump and a spike, there is a new flat line that only touches the tip of the spike. This shows what happens if you don't exclude weird events.](/images/posts/line_exceeding_all.png "Zooming back out to the original timeseries chart, we see a wiggly line with a hump and a spike, there is a new flat line that only touches the tip of the spike. This shows what happens if you don't exclude weird events.")

So if we wanted to capture the 99th percentile, we would choose to reject any connections over 8 (so we would probably pick 9). But hold up, what's that sound?

:fire: :fire: **Caution** :fire: :fire:

Choosing the wrong number for circuit breakers is bad, but doing it wrong here is much, much worse. The 99th percentile is not enough!

Learn from my pain. If you pick the 99th percentile, 1% of all of your requests to that resource **will be killed**.

:fire: :fire: **Caution** :fire: :fire:

I really can't emphasize this enough. You shouldn't just pick a number. You shouldn't pick "a couple higher than the 99th percentile" like I did.

















**Bulkheads limit the impact of a slow resource and serve to turn slow failures into fast failures. Together with circuit breakers, those fast failures will trip circuit breakers quickly which relieves pressure on the downstream resource**. Without bulkheads, the only way to handle slow failures is to tightly control read timeout settings, but with bulkheads throwing immediate errors, the errors arrive fast enough to trip circuit breakers all on their own; you no longer need read timeout settings to be strict.

Storytime:

In reality, the system I've been working on has 37 external services and 15 datastores. And naturally, being the product of 15 years of work, my team wasn't around when most of the code was written, our job was to stabilize it. Each client was (wildly) different (some even using different HTTP wrapper libraries), and many of them had some pre-existing resilience mechanisms, but none were consistent. It was a mess, but I promise, it's going to get better.

For the system my team worked on, even though there were 37 external connections, only 10 or so would *guarantee* that the site would fall over, so we could focus on just those at first. Similarly, while there were 15 datastores, 10 of them were shards, so those would be a huge impact if we could fix them. This greatly reduced the amount of work needed for us (though it was still pretty daunting!)

In reality, this really did work out very well for us. Our incident *impact* diminished dramatically, but the total number of incidents remained the same and every so often the circuit breakers wouldn't trip (or they would trip too often) leading to lengthy debugging sessions. Incidents impact was decreased, but it still felt like there was something broken.

It didn't help that the circuit breakers were rolled out piece-meal, one client at a time. There was no central place to configure them or data to understand them.

For us, we have some customers that have huge queries that take 85s to compute, so thankfully I only made this mistake on some lower volume resources, but it was still super embarrassing that I assumed I could "just add a couple of seconds to the average response time". You can't. You need to look at the statistics. But that's a rant for another day, we're here for bulkheads!

Again, not that *any of this* has happened to us. Who have you been talking to?
#### 2.2 Key Benefits
- _Failures Isolation_: The Bulkhead pattern protects different parts of the system from propagating failures, effectively limiting the scope of potential issues.
- _Resource Management_: By isolating resources, the pattern allows for better resource utilization, ensuring that specific components don't exhaust shared resources and cause performance degradation.
- _Improved Resilience_: The system's overall resilience is increased as it can continue to operate despite failures or high load affecting a single partition.
#### 2.3 Semian Gem vs. Hystrix
##### Semian
Semian is an open-source gem for Ruby that provides a suite of fault tolerance patterns for distributed systems. It supports various features like circuit breakers, bulkheads, and timeouts to secure systems against different types of failures.

Some advantages of Semian include:
- Ease of use and integration due to its lightweight design.
- Flexibility, allowing customization to suit your application's specific needs.
- Well-suited for systems running on a Ruby-based technology stack.
##### Hystrix
Hystrix is a popular library developed by Netflix for building resilient and fault-tolerant applications. It is particularly well-suited for Java-based applications and provides an array of fault tolerance patterns like circuit breakers, bulkheads, fallbacks, and caching.

The key benefits of Hystrix are:
- Battle-tested and widely adopted in various industry applications.
- Comprehensive component-level monitoring through the Hystrix Dashboard.
- Suitable for Java-based applications, specifically microservices architectures.

Adopting one of these implementations depends on the language and technology you're using, as well as the specific requirements of your application. In the next section, we'll delve into the practical aspects of implementing and tuning these patterns in our team's experiences.

3. **Our Implementation: Context and Motivations**

    - Describe the specific challenges your team faced and the objectives that drove your team to adopt and tune this pattern.
    - Introduce the tools and frameworks used, like New Relic and timeseries data management.
4. **Tuning the Bulkhead Pattern: Methodology and Steps**

    - Explain how the team utilized timeseries data from New Relic, including the specific metrics and analysis techniques.
    - Discuss the optimization process in detail, including key tuning parameters and their impacts on the system.
    - Use graphs, charts, and examples to illustrate patterns and insights.
5. **Pitfalls and Lessons Learned**

    - Share the issues you encountered during the tuning process and how each was addressed.
    - Offer advice for developers on best practices and potential pitfalls to avoid.
    - Discuss limitations and trade-offs of the Semian and Hystrix implementations, as well as any possible improvements or alternatives.
6. **Conclusion**

    - Summarize your main points, highlighting the importance of proper tuning when using the Bulkhead pattern.
    - Reinforce key takeaways from your experiences to emphasize their relevance to fellow senior engineers.
