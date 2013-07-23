---
layout: page
body_classes: exercise
title: Week 2 &mdash; Thursday
---

### Morning warmup

* [Jumpstart #15 - Say](https://github.com/JumpstartLab/warmup-exercises/tree/master/15-say-1)

### Daily announcements
### Comprehension activities
### Comprehension questions

* What are the challenges associated with testing asynchronous code?
* What's the difference between Sinon and Jasmine?
* How do you think we use Sinon and Jasmine together? Which parts of which do we use?
* Without Sinon do you have to have a live server running? What are the problems with this?

### Lecture activities
### Lecture topic

* Async Jasmine

### Lecture notes

Naive waits

* `runs` forces things to be sequential
* `waits` waits for a certain amount of time to run an assertion. This ensures that tests are either slower than necessary, or broken 50% the time. Or both.

WaitsFor

* Wait for some function to be true
* Either wait for a variable to be set (bad because now our logic is riddled with code to enable tests)
* Or wait for some artifact to happen
* In the case of an ajaxy function that edits the dom after it finishes, we could ask it to wait to see if the dom gets edited.
* Also error prone, but at least it's timely

* [Quick overview of event handling](http://stackoverflow.com/a/11643322/203731)
{% highlight javascript %}
it('loads themes switcher link in head', function() {
  $('.theme-picker').trigger('click');

  waitsFor(function() {
    return $('head').contains('theme_switcher');
  }, 'theme switcher never loaded', 10000);
});
{% endhighlight %}

Speeding things up with Sinon.js

{% highlight javascript %}
// Function under test
function getTodos(listId, callback) {
  jQuery.ajax({
    url: "/todo/" + listId + "/items",
    success: function (data) {
      // Node-style CPS: callback(err, data)
      callback(null, data);
    }
  });
}

var server;

before(function () { server = sinon.fakeServer.create(); });
after(function () { server.restore(); });

it("calls callback with deserialized data", function () {
  var callback = sinon.spy();
  getTodos(42, callback);

  // This is part of the FakeXMLHttpRequest API
  server.requests[0].respond(
    200,
    { "Content-Type": "application/json" },
    JSON.stringify([{ id: 1, text: "Provide examples", done: true }])
  );

  assert(callback.calledOnce);
});
{% endhighlight %}

### Exercise activities
### Exercise

* Create these functions and test their effects by using async jasmine or Sinon.js
  * A function that when a button is clicked, waits 100ms then changes the background color of a div to green.
  * A function that sends an ajax call to search.twitter.com asking for the most recent 1500 pages of @vosechu's tweets (hint, probably want to mock this)
  * A function that sends an ajax call to example.org (which doesn't exist) but expects a certain response regardless.

***

### Afternoon warmup

* [Jumpstart #8 - Happy birthday](https://github.com/JumpstartLab/warmup-exercises/tree/master/08-happy-birthday)

### Exercise activities
### Exercise
### Helpful commands