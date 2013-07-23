---
layout: page
body_classes: exercise
title: Week 1 &mdash; Homefun
---

### Main project
* No main project this week

## Tuesday
### Reading to do before class
* Chris Pine's Learn to Program (Chapter 1-5)
* (Even students) Chapters 6,9
* (Odd students) Chapters 7,8

### Reading questions due before class

* What is your favorite color?
* How old are you in seconds? (If you did this with only a calculator how would you do it?)
* What is a String?
* What's the difference between single and double-quoted strings?
* How do you use a quote mark inside of a string? (escaping characters)
* What is a variable?
* How do you put a variable inside a string? (interpolation or concatenation)
* What does the to_s or the to_i method do and why do we need them? (type casting)

Evens:

* How do you call a method on a variable?
* How do you generate a random number between 1 and 20?
* How do you define a new method?
* How do you define a new method that takes 2 parameters?
* What is a method?
* What happens if you specify that it needs 2 parameters but you only give it 1? (arity)
* If you use a variable outside a function can it be used inside?
* If you assign a new value inside the function, what is the value of the variable after the function? (overwriting vs shadowing)
* If you don't explicitly return a value from a function, what is returned? (implicit return)

Odds:

* Why is `2 < 10 #=> true` but `'2' < '10' #=> false`? (lexicographical ordering)
* What are the only two values that evaluate to false in Ruby? (falsy values)
* What happens if you use `=` instead of `==` in a conditional?
* What keyword do you use to stop a loop?
* If you end up executing an infinite loop how do you stop it? (SIGKILL)
* Why would you ever want to use `while true`?
* What do the `&&` and `||` operators do? (logical operators)
* What is the difference between `if !false` and `unless false`? (logical not)
* What is an array?
* What does it mean for an array to be zero indexed?
* What is the method in 8.1 we use to walk over all values in an array?
* What do `push`, `pop`, and `last` do? Is there a `first`?

### Resources
* [Code Academy: Ruby](http://www.codecademy.com/tracks/ruby)
* [Try Ruby](http://tryruby.org)
* [Ruby in 100 minutes](http://tutorials.jumpstartlab.com/projects/ruby_in_100_minutes.html)
* [Learn Ruby the Hard Way](http://ruby.learncodethehardway.org/)
* [Not for the masses](http://blog.obiefernandez.com/content/2009/09/10-reasons-pair-programming-is-not-for-the-masses.html)

## Wednesday
### Reading to do before class

* Chris Pine's Learn to Program (Chapter 10)
* (Even students) Chapter 11
* (Odd students) Chapter 12

### Reading questions due before class

* What is recursion?
* When learning recursion, what is the defacto "hello world" style program?
* Use pseudo code to complete a recursive sort
* Hint: There are three steps to any recursive algorithm
	1. Check to see if there's any work left to do and return if not. (early return)
	2. Do some work (reduce the problem)
	3. Call yourself (recurse) (sometimes 2 & 3 are the same step)

Evens:

* How do you redirect the output of a program to a file?
* How do you open and read the contents of a file?
* How do you open and write text to a file?
* How do you put a variable inside a string? (Interpolation)
* What does YAML stand for?
* How do you convert an object to YAML and then convert it back to an object? (Marshal/Serialize)
* How do you do a recursive search for files when using Dir (Globbing)

Odds:

* What does `+` do to a Time object?
* Explain what the epoch is. When does the epoch end? What happened to 30-year house loans in 2008?
* How is a Hash different from an Array?
* When using each on a Hash, will objects always come out in the correct order?
* What is a Range? How do you puts all the numbers from 0 to 26?
* What is the difference between `Time.now.class` and `Time.class`?

### Resources
* [Recursion with Zombies and Cats](http://inventwithpython.com/blog/2011/08/11/recursion-explained-with-the-flood-fill-algorithm-and-zombies-and-cats/)
* [Older, but actually helpful YAML docs](http://www.ruby-doc.org/stdlib-1.8.7/libdoc/yaml/rdoc/YAML.html)

## Thursday
### Reading to do before class
* Chris Pine's Learn to Program (Chapter 15)
* (Even students) Chapter 13
* (Odd students) Chapter 14

### Reading questions due before class
* What is a REPL? Is `irb` a REPL, why or why not?
* Why is the PickAxe book called PickAxe?

Evens:

* How do we add methods to existing classes or modules (Reopening)
* Why would we want to reopen a class or a module?
* What is the first method called when you instanciate an object? (Constructor)
* Could you call `initialize` or redefine `new`? Why would you or wouldn't you do that?
* What does the private keyword do?

Odds:

* What is the difference between a Proc and a method?
* Could you have defined `maybe_do` in some way other than using a Proc?
* How do you create a method that accepts a block as an argument?
* When you've passed a block into a method, how do you call it in the method? (Yield)
* Try profiling some of your code using the `profile` method in the book. Show me the output of the profile in a comment above the code. (Computers are fast, you may need to use sleep or a large number of iterations to make a meaninful number. Start with `10000.times do`)

### Resources
* [Apidock](http://apidock.com/ruby)
* [PickAxe](http://www.ruby-doc.org/docs/ProgrammingRuby/)
