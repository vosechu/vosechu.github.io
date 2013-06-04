---
layout: page
body_classes: exercise
title: Week 3 &mdash; Wednesday
---

### Morning warmup

* [Jumpstart #10 - Gigasecond](https://github.com/JumpstartLab/warmup-exercises/tree/master/10-gigasecond)

### Daily announcements
### Comprehension activities
### Comprehension questions

* What is progressive enhancement? Does it actually matter?
* What do these do: val(), text(), html(), attr()
* What do the above functions do when given an argument?
* How do you create html snippets to add to the page?
* How do you empty an element?
* How do you delete an element?
* When you remove an element, do its bindings disappear?

### Lecture activities
### Lecture topic
### Lecture notes

Progressive enhancement

* Percent of people running browsers with JS turned on - >= 99%
* Percent of googlebots running JS - 0%
* Percent of web pages with critical errors preventing JS from running - 50% at some time or another
* Can you say that 100% of people hitting your site universally do not need JS? If so, screw progressive enhancement.

Binding to elements we add to the page
Replacing content

{% highlight javascript %}
// ignore this for now
$('#content li').on('click', function () {
  $(this).hide();
});

// Creating content
var replacement = $('<ul><li>hi!</li></ul>');
// var replacement = $.load('snippet.html');
// var replacement = _.template('snippet.html', {hi: "mom"})();
$('#content').html(replacement);

$('li').trigger('click');

// Resilient bindings
$('#content').on('click', 'li', function () {
  $(this).hide();
});

{% endhighlight %}

### Exercise activities

* Recreate a game

### Exercise

Step 1:

* Start a new project with yesterday's game in mind. This time there is only one box, the Wipe link, and a Reset link.
* When you click on the box, not only does it turn blue, it spawns boxes next to, above and below the box.
* Wipe now removes the color of all the boxes, but doesn't remove the new boxes.
* Reset removes all the extra boxes.

Step 2:

* Add a counter and a score tracker to the bottom of the game.
* When you click on a box it spawns boxes near it and colors them, but the next click turns all five boxes red.
* Each click reduces the play counter and changes the score tracker to reflect how many red and green boxes there are on the field.

***

### Afternoon warmup

* [Jumpstart #3 - Scrabble](https://github.com/JumpstartLab/warmup-exercises/tree/master/03-scrabble)

### Exercise activities

* 30-min rotations with your pair. Each of you should work on your own account on codeacademy.com. The second time through should go much faster.

### Exercise

* [Code academy: jQuery](http://www.codecademy.com/tracks/jquery)