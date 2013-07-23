---
layout: page
body_classes: exercise
title: Week 3 &mdash; Thursday
---

### Morning warmup

* [Jumpstart #11 - Scrabble score](https://github.com/JumpstartLab/warmup-exercises/tree/master/11-scrabble-score)

### Daily announcements
### Comprehension activities
### Comprehension questions

* What is JSON?
* What is AJAX and why is it cool?
* Why don't we allow cross-domain requests?
* How do we get around this?
* What's the difference between $.get and $.getJSON?
* Does code immediately after an ajax call get run before or after the ajax call finishes?

### Lecture activities
### Lecture topic
### Lecture notes

Setting up a server for testing AJAX code locally

{% highlight bash %}
rails new local_test
cd local_test
rails s
{% endhighlight %}

* Add files to /public. No need to restart rails
* Add an html boilerplate to /public with js includes

Connecting to a public JSON api (making a mini bstshk)

* https://search.twitter.com/search.json?q=domo-kun&callback=?

### Exercise activities

* Recreate a game

### Exercise

Step 1:

* Start a new project with the first day's game in mind. This time there is a 10x10 grid of 80x80 pixel squares, two text fields above with the labels "P1 Twitter Handle" and "P2 Twitter Handle"
* When P1 clicks on a square, change the background color to blue and download the twitter user's photo from [here](https://dev.twitter.com/docs/api/1/get/users/profile_image/%3Ascreen_name). Place the photo in the center of the square with 10px padding around it.
* When P2 clicks, change the color to red and download that players image.

Step 2:

* On the right of the board add a column about 300px wide.
* Each time a player plays download a random tweet of theirs from [here](https://dev.twitter.com/docs/api/1/get/search). Set rpp=1 and page=rand(1500).
* Now use two funny twitter handles and see how they match up as you play 4 in a row.

Step 3:

* Figure out how to calculate if there's a 4 in a row match. If there is display a fun success message above the game.

***

### Afternoon warmup

* [Jumpstart #4 - Bob](https://github.com/JumpstartLab/warmup-exercises/tree/master/04-bob)

### Exercise activities

* 30-min rotations with your pair. Each of you should work on your own account on codeacademy.com. The second time through should go much faster.

### Exercise

* [Code academy: jQuery](http://www.codecademy.com/tracks/jquery)