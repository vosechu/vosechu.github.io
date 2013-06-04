---
layout: page
body_classes: exercise
title: Week 3 &mdash; Homefun
---

### Main project

Create a game. Details are in the morning activities.

#### Homework

In addition to committing and pushing each night, please add a note to your notes repo with the answer to the reflection activity and any other thoughts from the day. This should be > 100 words each day.

## Monday
### Reading to do before class

* Learning jQuery: Chapter 1,2
* [Treehouse: Javascript foundations: variables](http://teamtreehouse.com/library/websites/javascript-foundations/variables/basics)
* [Treehouse: Javascript foundations: functions](http://teamtreehouse.com/library/websites/javascript-foundations/functions)

### Reading questions due before class

* In your own words, summarize the 7 things on page 9-11 that jQuery does well
* How do you include external javascript files in HTML
* Should jquery.js get included before or after our project files?
* What does this code do and why do we use it? `$(document).ready()`
* What code would you use to select these things:
  * an element
  * an id
  * a class
  * a `p` tag, inside a `div` with class "turkey", inside a `body` with the id "thanksgiving".
* How would you add "tiger stripes" to a table with jQuery? (tiger stripes are alternating background colors)
* How do we select only checkboxes that are currently checked?
* (research) What is the keyboard command to open the Chrome element inspector? To open the Chrome console?

### Resources

## Tuesday
### Reading to do before class

* Learning jQuery: Chapters 3,4

### Reading questions due before class

* What is the most common short version of `$(document).ready()`?
* What is "progressive enhancement"?
* How do you bind a click event to a button?
* Inside a click handler, what is the variable `this` set to?
* What is event bubbling?
* How do we stop an event from bubbling up the chain?
* How do we stop an element from taking its default action (e.g. a submit button will refresh the page or submit a form)
* How do we remove a binding?
* How do we hide and show elements?
* How do we blur or slide elements?

Notes:

As of jQuery 1.9, several things have changed.

* Short names are no longer used. `click`, `blur`, etc.
* `bind` and `live` are now `on`. e.g. `$('button').on('click', ...)`
* `toggle` is no longer an event, so we do:
  {% highlight javascript %}
  $('button').on('click', function () {
    this.toggle();
  });
  {% endhighlight %}


### Resources

## Wednesday
### Reading to do before class

* Learning jQuery: Chapter 5

### Reading questions due before class

* How do you alter an `a` tag's href attribute?
* How do you create new content and add it to the page?
* How do you move content within the page?
* What jQuery function do we use to iterate over all elements in a jQuery set?
* How do you copy a DOM element? How do you copy any event listeners as well?
* What's the difference between `.text()` and `.html()`?
* How do we remove all the content inside an element?
* When you insert new content into the page, does it have bindings attached to it? If not, how do we make sure that existing bindings that _should_ have targeted the new element, do?


### Resources

## Thursday
### Reading to do before class

* Learning jQuery: Chapter 6

### Reading questions due before class

* In your own words, what is AJAX and why is it worth knowing about?
* How do you download an html fragment and assign it to a variable?
* What is JSON and why do we love it?
* What function do we use to download a JSON snippet from a server?
* How can we provide a function to $.getJSON which allows us to act on the data after it finishes downloading?
* What is the `.val()` function useful for? How does it compare to `.html()`?
* How do we specify an error callback for `$.get`?
* What is JSONP and how do we use it to get around cross-origin policies?
* What are the drawbacks of JSONP?

### Resources