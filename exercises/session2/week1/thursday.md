---
layout: page
body_classes: exercise
title: Week 1 &mdash; Thursday
---

### Morning warmup

[Jumpstartlab #3 - Scrabble](https://github.com/JumpstartLab/warmup-exercises/tree/master/03-scrabble)

### Daily announcements

### Comprehension Activity

* Evens/Odds: 1-minute lightning talk

### Comprehension Questions

Questions for odds:

* What is a REPL?
* How do we add methods to existing classes?
* What advantage is there to reopening a class or module?
* What does the private keyword do?
* What method is called when you create a new object?
* What is a constructor?
* What is a Proc?
* What values are falsy in Ruby?

Questions for evens:

* Why is the Pickaxe book called that?
* What is a Proc?
* How do you create a method that accepts a block as an argument?
* When you've passed a block into a method, how do you call that block?
* How do you use a Proc to profile code?
* How do you call a method that accepts a block as an argument?
* What is a constructor?
* What does the `return` keyword do?

### Lecture topic

* Ruby (New classes, Reopening classes, Blocks & Procs, Beyond)

### Lecture activities

* Mini-lecture

### Lecture notes

{% highlight ruby %}
# Reopening classes/modules

class String
  def bites
    puts "nom nom nom"
  end
  def self.nyble
    puts "ommmy nom nom"
  end
end
module Enumerable
  def poodle
    puts "woof!"
  end
end

s = "hello"
s.bites #==> "nom nom nom"
String.nyble #==> "ommmy nom nom"
s.nyble #==> NoMethodError
s.class.nyble ==> "ommmy nom nom"

String.new #==> "" # Object created successfully
Enumerable.new #==> NoMethodError: undefined method `new' for Enumerable:Module

{% endhighlight %}

### Exercise activities

* Ping-pong/Rallycar

### Exercise

#### Creating a localization method

Our goal is to add an instance method to String that allows us to output strings in a different language via a simple translation method. But since this can sometimes be expensive, we want to implement a timing block around the whole thing to find out how damaging it is.

Piratese:

* Create a algorithm that translates a String into Piratese.
* Reopen string to add an instance method `to_pirate`. This should allow you to call `"Are you here?".to_pirate` and get "Yarr you here?".
* Create a new class called `PirateString < String` which has a method `to_s` which outputs itself in piratese. If you call `puts PirateString.new("Are you here?")` you should get "Yarr you here?". `puts` will call to_s on any object it receives as an argument.

Output:

* Upload the file to Github regardless of how far you get.

Timing:

* We would like to find out which of these methods takes longer to run.
* Create a method called `profile` which takes a single argument called `&block`.
* Inside this method have it store `Time.now` before and after we execute our block.
* `profile` should use `puts` to output the total time used by the block.
* `profile` should also return the number of milliseconds it took to run the block.
* Once you have profile, use it to create 10000 strings and send `to_pirate` to each one.
* Similarly, use it to time creation of 10000 PirateString objects and call `to_s` on each one.

Output:

* Which one worked fastest? Any ideas why? Leave comments at the top of the file to this effect.
* Which parts of your algorithm take the longest? (You can wrap individual lines of code in `profile` but don't do it 10k times.)
* Push changes to Github regardless of how far you get.

Extensions:

* Reopen String to add a class method called `in_pirate` which takes a String as an argument.
* This should translate the argument and store it in a new String
* How is the performance of this version of the String?

***

### Afternoon Warmup

* Practice OS X Shortcuts
* Work with your table to find a way to share shortcuts or flash cards
* Practice typing

### Lecture topic

* Troubleshooting

### Lecture activities

* Mini-lecture

### Lecture notes

Types of bugs:

* Exceptions – Unexpected conditions occurred
* Errors – Incorrect input/conditions, Incorrect syntax
* Failures – Incorrect code (Logic problem, unhandled timeout, etc)

Which type of bug are these things?

* Doing something 25 times instead of 26
* Forgetting an `end` keyword
* Giving too many arguments to a method
* Out of disk space when uploading an image
* Having too many closing parens

Most common problems (memorize these):

* `test.rb:2: syntax error, unexpected end-of-input, expecting keyword_end`
* `test.rb:2: syntax error, unexpected end-of-input, expecting '}'`
* `test.rb:5: syntax error, unexpected keyword_end, expecting ')'`
* `test.rb:1:in '<main>': undefined method 'to_pirate' for "Hello":String (NoMethodError)`
* `test.rb:1:in '<main>': undefined method 'to_pirate' for nil:NilClass (NoMethodError)`
* `test.rb:3:in 'to_pirate': wrong number of arguments (1 for 0) (ArgumentError)`
* `test.rb:3:in 'to_pirate': wrong number of arguments (0 for 1) (ArgumentError)`

How do we deal with problems?

* Read from the top of the error down. The functions listed lower in the backtrace called the higher functions somewhere in their code.
* Search for things in the backtrace that are our code.
  * When dealing with `syntax error`s or `ArgumentError`s we generally find them in first line of the backtrace.
  * If this is a syntax error, fix it and move along.
* NoMethodError
  * If there is a non-nil class, check your assumptions about that object.
    * Check your spelling. Check it again.
    * Check that this is the type of object we're supposed to have
  * If the class is `nil:NilClass`, the object you thought you were using doesn't exist yet
    * Check your spelling of both the method and the variable.
    * Check that the variable is supposed to exist at that point.
    * If you're calling something through a model, check that the associated object exists. (this is also a code smell, violation of Law of Demeter)

* Isolate the problem and find the offending code
  * Comment out code, use `puts`, do whatever you need to to find the one line of code where the problem started.
  * For NilClass errors you may find that the logic problem started very far down the backtrace. Nils tend to travel very far.

* Spend a moment thinking through why you think the problem occurred.
  * Seriously, one whole minute.
  * Form a hypothesis about what you think went wrong

* Read any comments or documentation around the bug
* Read the code around the bug
  * See if you can find an example of something similar in the rest of the code base

* Examine assumptions
  * Using puts is okay
  * The gem "debugger" or "ruby-debug" will allow you to open a debugging session live and step through code.
  * The gem "pry" will allow you to open irb in the code, but doesn't allow stepping like debugger.

### Exercise

[RubyMonk Debugging exercises](http://rubymonk.com/learning/books/4-ruby-primer-ascent/chapters/50-debugging)

### Extensions

* Look into how to install pry, debugger or ruby-debug
* Compare and contrast the two implementations, what's better or worse?
* Write out 3x5s on the syntax of the two different debuggers
