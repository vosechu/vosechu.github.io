---
layout: page
body_classes: exercise
title: Week 2 &mdash; Tuesday
---

### Morning warmup

* [Jumpstart #13 - Wordy calculator 2](https://github.com/JumpstartLab/warmup-exercises/tree/master/13-wordy-calculator-2)

### Daily announcements
### Comprehension activities
### Comprehension questions

* What is a spy and how does it differ from a mock or a stub?
* What are the use cases for testing JS? Are the different than in Ruby?

### Lecture activities
### Lecture topic

* Spies, Mocks

### Lecture notes

Implementing plugins vs creating our own

* How do you determine whether it's something to do in a function vs a plugin vs use someone else's plugin?
* Easiest plugin: `function do_something_cool() {}`
* Function: 1-20 LoC
* Plugin/Namespace: 20-100 LoC
* Open source plugin: >100 LoC

Some common plugins

* Modal/popup dialogs
* Carousels
* Tabs/Accordions
* Datepickers
* Typeahead/chosen.js
* jQuery.validate
* Lightbox/Colorbox popup galleries
* Parallax

What is a spy and how is it different from a mock/stub?

* Test stub (used for providing the tested code with "indirect input")
* Mock object (used for verifying "indirect output" of the tested code, by first defining the expectations before the tested code is executed)
* Test spy (used for verifying "indirect output" of the tested code, by asserting the expectations afterwards, without having defined the expectations before the tested code is executed)
* Fake object (used as a simpler implementation, e.g. using an in-memory database in the tests instead of doing real database access)
* Dummy object (used when a parameter is needed for the tested method but without actually needing to use the parameter)

-- <cite>Meszaros, Gerard (2007). xUnit Test Patterns: Refactoring Test Code. Addison-Wesley. ISBN 978-0-13-149505-0.</cite>

* Spies allow us to inquire about the output after the fact
* But if we can redirect or give fake data, then they're actually mocks

### Exercise activities
### Exercise

* [Spies by example (first three examples)](https://github.com/pivotal/jasmine/wiki/Spies)

* Create these functions and test their effects
  * A function that calls Math.floor
  * A debug function that calls a property on an object, then outputs it to console.log with `***` added to the front and the end of the property value.
  * A function that takes a function as an argument then calls that function with a predefined value.
* Spy on console.log, call it 3 times, then assert that it was called the right number of times
* Spy on $.load and have it return an html string that you want it to return


***

### Afternoon warmup

* [Jumpstart #6 - Robot name](https://github.com/JumpstartLab/warmup-exercises/tree/master/06-robot-name)

### Exercise activities
### Exercise
### Helpful commands