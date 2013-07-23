---
layout: page
body_classes: exercise
title: Week 2 &mdash; Monday
---

### Morning warmup

* [Jumpstart #12 - Wordy calculator](https://github.com/JumpstartLab/warmup-exercises/tree/master/12-wordy-calculator)

### Daily announcements
### Comprehension activities
### Comprehension questions

* When you think about testing javascript, what use cases come to mind? Are they different from ruby?
* Is jasmine a unit test framework or an integration test framework?
* What is the difference between BDD and TDD?
* Should jasmine be separated from our production website code or should it run in the layout?

### Lecture activities
### Lecture topic

* Introduction to Jasmine & BDD

### Lecture notes

What is BDD

* Generate a list of stories
* Focus on the features, not the implementation
* Write acceptance tests before code
* Write tests in a way that is understandable to management

Reflections on BDD vs TDD

* BDD is easier to type (specifically rspec)
* BDD's focus on the features allows the implementation to change easily
* BDD is easy to explain and easier to sell to management types
* TDD is built-in to Ruby and JS
* TDD is better at catching logic errors because we're testing the tech instead of the feature

Role of testing in Javascript

* What do we test in JS?
* Superficial JS code, how much do we test? Probably not at all.
* Plugins, JS/MVC, etc. Hell yes.
* So why are we doing this?
  * It's an excuse to test in a totally different mindset.
  * It's an excuse to use BDD
  * You will write JS plugins and you will do JS/MVC at some point.

Running Jasmine in the layout vs separation

* Core tenant of unit testing: Test logic in isolation as much as possible
* Core tenant of integration testing: Test logic as it interacts with other systems

* Should we run Jasmine in our index.html or have a separate testRunner.html?
* In index.html
  * When tests are a key part of your site
  * When you want to see if you DOM manipulations work on your site in reality
* In separate testRunner.html
  * When you want to pull logic out and test it isolated from other parts of the site
  * When you want to test that DOM manipulation works the way you expect no matter how the main site has changed

* So what's the answer?
  * Both!
  * Unit test your logic in isolation
  * Integration test your logic in the index.html (but make sure it's easy to rip out for production)

### Exercise activities
### Exercise

* For the four warmups you did last week, go back and create the tests based on those in the test.rb
* Focus more on the syntax than actually getting it working, your implementation of the warmup may not be in the shape needed for testing.
* Take special note of incompatibilities that make it difficult to test and write them on 3x5s
* The point is to practice enough that you can make a new test project in your sleep

***

### Afternoon warmup

* [Jumpstart #5 - Grandma](https://github.com/JumpstartLab/warmup-exercises/tree/master/05-grandma)

### Exercise activities
### Exercise
### Helpful commands