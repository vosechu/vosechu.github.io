---
layout: page
body_classes: exercise
title: Week 2 &mdash; Homefun
---

### Main project

Replacing followcost.com with a command-line utility

Followcost was a great site when it began but it had a few problems.  Now that its off the Internet it has even more.

Our goal is to make a replacement command line app that will tell us who our most prolific twitter people are and possibly give recommendations about who to unfollow. Details follow the steps.

#### Steps

Step 1: Start building the script without tests. After the 3:30 walk, switch to writing tests for the code you already have.

Reflection activity: how often do you need to change your code to make it work for the tests?

Step 2: Delete the code you wrote yesterday except for the tests. Without referencing the code from yesterday, try to recreate just by running the test suite.

Reflection activity: how many times did you get into a rabbit hole when you were just trying to make the test suite green?

Step 3: This time, delete all the code and the tests. Instead, start with a sheet of paper and write out all the features you want. Once you have a list of features, write out the tests and make sure they're red. Once they're red, add `skip` to the beginning of all but the easiest test. Start writing code to satisfy the tests. If you complete all your features write more tests and add more features.

Reflection activity: when you focus on the features instead of the code, how different do your tests look?

#### Details

Followcost.com rated your friends in milliscobles, a fictitious unit which was defined thusly: "'1/1000 of the average daily Twitter status updates by Robert Scoble as of 10:09 CST September 25, 2008.' At that time, Scoble was averaging 21.21 tweets per day, so a milliscoble is 0.02121 tweets per day."

Our script should do several things:

* Take a username and calculate their milliscoble rating
* Take a username and find the milliscoble rating of all their friends
* Sort those users with the highest number of milliscobles and output it to the terminal
* Run via the terminal

To create a command-line interface you should use Thor or Rake. Thor docs can be found here: [Thor](http://whatisthor.com/)

To create network connections use ruby's built-in 'net/http': [net/http docs](http://ruby-doc.org/stdlib-2.0/libdoc/net/http/rdoc/Net/HTTP.html), [cheat sheet](http://www.rubyinside.com/nethttp-cheat-sheet-2940.html)

Twitter's search api can be found here: [search api](https://dev.twitter.com/docs/api/1/get/search). That should do most of the work but there may be other api endpoints that you need.

#### Homework

In addition to committing and pushing each night, please add a note to your notes repo with the answer to the reflection activity and any other thoughts from the day. This should be > 100 words each day.

## Monday
### Reading to do before class

* Eloquent Ruby (Chapter 1,9)

### Reading questions due before class

* When is it acceptable to use CamelCase?
* When do we use `do...end` instead of `{...}`?
* In Test::Unit, what is the difference between `assert` and `assert_equal`?
* Where do we put code that needs to be run before or after each test?
* When we use `setup`, why do we need to use instance variables?
* How do you run all the specs in a folder?
* What is a stub?
* What is a mock?
* Why do we make sure that our tests are red before fixing them?
* If your company won't allow full tests, what does it mean to "exercise your code, even just a little bit."

### Resources

* [Treehouse: Testing](http://teamtreehouse.com/library/programming/ruby-foundations/testing)
* [Ruby style guide](https://github.com/bbatsov/ruby-style-guide)

## Tuesday
### Reading to do before class

* Eloquent Ruby (Chapter 2,3)

### Reading questions due before class

* What alternative keyword can we use if we're negating the boolean expression inside our `if`?
* What is the 'negative doppleganger' for while?
* What is a "modifier form" of an expression? (Which I call a post-conditional)
* What does a case statement return by default?
* What two values evaluate to false inside an `if`?
* What is a ternary expression used for (`?:`)?
* What is a "guarded or" used for (`||=`)?
* What's the fastest way to make an array of words?
* When using symbols as Hash keys, what are the two ways to initialize a Hash using the curly brace notation? (1.9 hash syntax)
* What is the name of the `*` operator?
* Should you use a `for` loop to iterate over an Array or Hash? If not, what's the alternative?
* What is the difference between `each` and `map`?
* What is a bang method?

### Resources

* [Treehouse: Loops](http://teamtreehouse.com/library/programming/ruby-foundations/loops)
* [Treehouse: Blocks](http://teamtreehouse.com/library/programming/ruby-foundations/blocks)

## Wednesday
### Reading to do before class

* Eloquent Ruby (Chapter 4)

### Reading questions due before class

* How do you add a newline to a String?
* What is the difference between single and double quotes?
* How would you replace all instances of the word 'pie' with the word 'pizza' in a String?
* What is the difference between `gsub` and `gsub!`?
* Do a little research on apidock.com and find 5 methods on String that you think are interesting and could be useful.

### Resources

* [Treehouse: Strings](http://teamtreehouse.com/library/programming/ruby-foundations/strings)

## Thursday
### Reading to do before class

* Eloquent Ruby (Chapter 5)

### Reading questions due before class

* What does the dot character match?
* How do you match exactly 3 lower case characters
* How do you match a range of characters?
* How do you match any whitespace?
* How do you match any number?
* How do you match either "ferret" or "weasel"?
* What's the difference between `*` and `+`
* What does the operator `=~` do in Ruby?
* How do you match the beginning/end of a line?
* Regular expressions marked the beginning of my serious programmer career. Seriously spend some time on this. In fact, write down the time and remember where you were when you learned regexen.

### Resources

* [Rubular: Ruby regex editor](http://rubular.com/)
* [Treehouse Workshop: Cucumber](http://teamtreehouse.com/library/treehouse-workshops/behaviordriven-development-with-cucumber)