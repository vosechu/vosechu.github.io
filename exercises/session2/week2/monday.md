---
layout: page
body_classes: exercise
title: Week 2 &mdash; Monday
---

### Morning warmup

* [Jumpstart #4 - Bob](https://github.com/JumpstartLab/warmup-exercises/tree/master/04-bob)

### Daily announcements
### Comprehension activities

* Discuss with neighbor, then share with class

### Comprehension questions

* Why is code formatting/style so important?
* What should the punishment be for breaking style guidelines?
* How will we know when our colleagues break style guidelines before we run into their code?
* Is ruby predominantly CamelCase or snake_case?

* What is testing?
* What is automated testing?
* What is a stub?
* What is a mock?
* Why do we run tests to ensure that they're red before fixing them?
* What does it mean to exercise code even if you can't test it fully?

### Lecture activities

* Mini-lecture

### Lecture topic

Introduction to testing (Running test suites)

### Lecture notes

Working with minitest for now, get to rspec very soon.

Types of tests:

* Tests for all input/output combinations
* Tests for complicated bits of a program
* Tests for things you think might get accidentally deleted by coworkers

Why write test-first:

* Clarity of thought going into the task
* Clear delineation of whether you're getting into a rabbit hole (things you write should be solving tests, not rethinking or improving)
* You aren't going to write them afterwards
* Seriously, you aren't going to take the time afterwards

Stubbing/Mocking:

* Draw diagram of two objects talking together
* What if we replaced just a method? "Stub"
* What if we needed to replace more? Or verify that some internal things happened? "Mock"
* Normal method: setup, exercise, verify, teardown
* With mocks: setup, setup expectations, exercise, verify behavior, verify, teardown

### Exercise

Operations:

* If you've not tried it yet, make sure that you know how to run tests. Most of the warmups have a test suite
* Get watchr or autotest-standalone running and testing your code automatically
* Make sure that you can create a boilerplate test file using minitest without needing any resources.
* Make sure that you can create a test within your boilerplate (just use `assert true` as the main line)
* Make sure that you can use the setup/teardown functions

Stubbing/Mocking:

* [Test classes](https://gist.github.com/vosechu/5658490)
* Create a test file for one of the classes and in the setup function create instances of both classes
* Running cat#to_s is very expensive so it would be nice if we could return a canned response since we just want to test that `bark_at` works.
* Add a stub on cat#to_s which will return a canned response
* Next, use a mock instead of just the stub to verify that `to_s` is getting called exactly once

### Helpful commands

{% highlight bash %}
# Run one minitest
ruby something_test.rb

# Watchr
watchr Watchrfile

# Autotest
gem install autotest-standalone autotest-growl
autotest -cf
{% endhighlight %}

{% highlight ruby %}
# file: "~/.autotest" or "./autotest"
require 'autotest/growl'

Autotest.add_hook :initialize do |autotest|
  %w{.git .svn .hg .DS_Store coverage db log tmp vendor ._* .sqlite3}.each do |exception|
    autotest.add_exception(exception)
  end
end

# file: "./Watchrfile"
watch('(.*).rb') { |md| system "ruby test.rb"}
{% endhighlight %}

***

### Afternoon warmup

* Practice OS X Shortcuts
* Work with your table to find a way to share shortcuts or flash cards
* Practice typing

### Exercise

With your pair:

* Look over the ruby style guide and pick out some things that weren't mentioned in the intro section of Eloquent Ruby
* Do step one of the main project

Note:

This is time to engage with your lessons today, not to work on homework for tomorrow. While I may not be here watching over you, this is valuable time when I'm not driving your schedule. Play, research, inquire, engage with today's discussion in your way.
