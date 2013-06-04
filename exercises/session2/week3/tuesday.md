---
layout: page
body_classes: exercise
title: Week 3 &mdash; Tuesday
---

### Morning warmup

* [Jumpstart #9 - Space age](https://github.com/JumpstartLab/warmup-exercises/tree/master/09-space-age)

### Daily announcements
### Comprehension activities
### Comprehension questions

* What is event bubbling?
* What is a binding?
* What is a callback?
* Do bindings work if you add an element to the page?
* What is an anonymous function? How do you call it?

### Lecture activities
### Lecture topic
### Lecture notes

* What is a callback?
* What is event bubbling?
* Preventing bubbling/default

{% highlight javascript %}

// named function
function ted(e) {
  e.stopPropagation();
};
$('button').on('click', ted);

// anon callback
$('a').on('click', function (e) {
  e.preventDefault()

  var href = $(this).attr('href');

  console.log(href);
  if (href.match(/#/)) {
    $(href).toggle();
  }
});

{% endhighlight %}

### Exercise activities

* Recreate a game

### Exercise

Step 1:

* Create an html page with a 3x3 grid of divs that are 80x80 pixels with 10 pixels of padding all around. Give them all a background color of light gray.
* Underneath the grid add a link with the word "Wipe" in it.

Step 2:

* When you click on a box, change the background-color of the box to blue. Clicking again reverts the color to gray.
* When you click the Wipe link, all the boxes should revert to gray
* If all the boxes are Green, show a hidden div that says congratulations!

Step 3:

* When you click a box, toggle the background color of that box and those boxes directly connected to it.
* Once that's working, change the board size to be 5x5

***

### Afternoon warmup

* [Jumpstart #2 - Leap year](https://github.com/JumpstartLab/warmup-exercises/tree/master/02-leap-year)

### Exercise activities

* 30-min rotations with your pair. Each of you should work on your own account on codeacademy.com. The second time through should go much faster.

### Exercise

* [Code academy: jQuery](http://www.codecademy.com/tracks/jquery)