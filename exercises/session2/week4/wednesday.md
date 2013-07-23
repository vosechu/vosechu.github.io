---
layout: page
body_classes: exercise
title: Week 2 &mdash; Wednesday
---

### Morning warmup

* [Jumpstart #14 - Wordy calculator 3](https://github.com/JumpstartLab/warmup-exercises/tree/master/14-wordy-calculator-3)

### Daily announcements
### Comprehension activities
### Comprehension questions

* What is a fixture and why do we use them?
* What is a spy?

### Lecture activities
### Lecture topic

* Testing the DOM

### Lecture notes

Warning about directly affecting the DOM

* Directly affecting the dom is bad, inflexible, error-prone, not exportable
* How do major plugins do it?
* `$('#tabs').tabs()`
* That said, we aren't going to do that right now. But know why they do it this way.

Unit Testing the DOM

* Create the smallest fixture possible to represent the test case
* Do not copy from production code, that's not the point at all and production is going to change constantly
* Load the fixture, trigger the function or call it directly
* Assert stuff happens to it

Integration Testing the DOM

* Test the critical pathways
* Instead of testing that popups pop, test that all the things that should pop a popup do

### Exercise activities
### Exercise

* Integrate jasmine-jquery and jasmine-fixtures
* Create some fixtures manually and via jasmine-fixtures. Which one feels better to you? (This will be a personal preference)
* Create these functions and test their effects
  * A function that edits the text in a div
  * A function that adds a class to a div
  * A function that creates a new div and adds it to the document
  * A function that increases the font-size of all text by 40%
  * A function that changes the color of a box between gray and green when clicked repeatedly
  * A function that animates moving a div across the page

### Helpful commands

***

### Afternoon warmup

* [Jumpstart #7 - Psychology test](https://github.com/JumpstartLab/warmup-exercises/tree/master/07-psychology-test)

### Exercise activities
### Exercise
### Helpful commands