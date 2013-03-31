---
layout: page
body_classes: exercise
title: Week 9 &mdash; Overview
---

### Monday Stuff
* How was the weekend?
* Announcements
* Student announcements
* Stars for reading assignments
* Networking events for the week
* Call for lightning talks
* Warmup exercise

### Monday comprehension questions

### Weekly Topics
* Open source
* Deployment
* Gem review (Authentication, Access Control, Search, Caching)
*   http//www.intridea.com/blog/2011/5/13/rails3-gems
*   https//github.com/languages/Ruby/most_watched
* Host-a-hacker

### Weekly Theme
* Shipping open source
* Practice

### Weekly Home<del>work</del>**fun**
* Email me a link to your 9th Blog post. 1-2 pages (250-500 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* Ship one documentation fix to a major open source project

## Monday &mdash; 3/4/2013
### Topics
* Open source
* Breaking into communities
* Documentation fixes

### Goals
* Understand the importance of open source
* Build rails and run tests
* Get our first documentation fix on our portfolio

### Reading to do before class
* [Intro to open source (skim)](http://producingoss.com/en/introduction.html)
* [Contributing to Rails](http://guides.rubyonrails.org/contributing_to_ruby_on_rails.html)

### Additional reading resources
* [The Cathedral and the Bazaar](http://www.catb.org/~esr/writings/cathedral-bazaar/cathedral-bazaar/)

### Resources
* [The book on making open source projects work](http://producingoss.com/)
* [Installing rails from Git source](https://gist.github.com/sowawa/2515536)

### Helpful Commands
{% highlight bash %}
# Building and running tests
git clone git://github.com/rails/rails.git
cd rails
gem install bundler
bundle --without db
bundle exec rake test

# Installing built version of rails (inside rails checkout)
ruby install.rb 4.0.0.beta1

# Installing from source (one directory up from rails checkout)
gem install thor
ruby ./rails/railties/bin/rails new <project name> --dev
cd <project name>
bundle exec rails s
{% endhighlight %}

### Code for the board

* Verifying bug reports
* Testing patches
* Documentation patches

### Exercises

#### Warmup

* [#11 Scrabble](https://github.com/JumpstartLab/warmup-exercises/tree/master/11-scrabble-score)

#### Stage 1 (remembering/understanding)

* Answer these questions with your pair
  * Roughly how many open source projects fail?
  * Does an open source license guarantee hordes of volunteers?
  * Summarize the three paragraphs under the Jeremy Zawinski quote
  * In Rails, which coding conventions seem the oddest?
  * In exactly 12 words, summarize the Changelog conventions
  * How do you contribute to Docrails?

#### Stage 2 (application/analyzing)

* Clone and run the Rails test suite (activerecord should fail)
* Testing failing bugs
  * Find a recently accepted issue
  * Checkout the commit before that issue's sha
  * Add the tests from that issue and ensure that they're failing
  * Add in the patch from that issue and ensure the tests pass
  * Do a convention review and see if there are any issues
  * Check the documentation to ensure that it's reasonable
* Install git version of rails
  * Understand how to install via gem
  * Understand how to install from source
  * Use `diff -u` to inspect the two folders and see the difference

## Tuesday &mdash; 3/5/2013
### Topics

### Goals

### Important Threshold Concepts

### Reading to do before class

### Resources

### Helpful Commands
{% highlight bash %}
{% endhighlight %}

### Exercises

#### Warmup

* [#10 Gigasecond](https://github.com/JumpstartLab/warmup-exercises/tree/master/10-gigasecond)

#### Stage 1 (remembering/understanding)

* Answer these questions with your pair

#### Stage 2 (application/analyzing)

#### Boss Fight (evaluation/creation)

## Wednesday &mdash; 3/6/2013
### Topics

### Goals

### Important Threshold Concepts

### Reading to do before class

### Resources

### Helpful Commands
{% highlight bash %}
{% endhighlight %}

### Exercises

#### Warmup

* [#12 Wordy Calculator](https://github.com/JumpstartLab/warmup-exercises/tree/master/12-wordy-calculator)

#### Stage 1 (remembering/understanding)

* Answer these questions with your pair

#### Stage 2 (application/analyzing)

#### Boss Fight (evaluation/creation)
