---
layout: page
body_classes: exercise
title: Week 1 &mdash; Wednesday
---

### Morning Warmup

[Jumpstartlab #2 - Leap year](https://github.com/JumpstartLab/warmup-exercises/tree/master/02-leap-year)

### Daily announcements

* No announcements today

### Comprehension activities

Think-pair-share

### Comprehension questions

* What is recursion?
* What are the basic steps to make a recursive program?

### Lecture activities

* I-do-we-do-you-do

### Lecture topic

* Ruby (Recursion, Reading/Writing)

### Code for the board

I do:

* Draw a recursive function: factorial
* Draw out the entire call tree on the board
* Steps: check if done, reduce problem, call self

We do:

* Ask how we might do a recursive sort (2 parameters, unsorted and sorted)
* Draw out the signature
* Draw out the call tree if necessary

### Helpful commands

### Exercise

You do:

* Compute the sum of cubes for a given range a through b.
* Write a method called sum_of_cubes to accomplish this task
* Example Given range 1 to 3 the method should return 36

Taken from: http://rubymonk.com/learning/books/4-ruby-primer-ascent/problems/145-sum-of-cubes-from-a-to-b

***

### Afternoon warmup

* Practice OS X Shortcuts
* Work with your table to find a way to share shortcuts or flash cards
* Practice typing

### Lecture activities

* Live-code
* Discovery-process

### Lecture topic

* Algorithm Development

### Lecture notes

* Requirements gathering
* Build toolbox
* Whiteboard
* Test
* Code
* Refactor

Show these steps for today's jumpstartlab warmup

### Exercise activities

* Random-partner-pair

### Exercise

Read through four warmups:

Requirements gathering, write out what we know about the problems:

* How is the code supposed to be called?
* What classes are listed in the description?
* What outputs are listed?
* What methods/functions are listed in the description?
  * Are they functions or methods?
  * If they're methods, are they class or instance methods?
  * What arguments do the methods/functions take? How many?
* Are there any automated tests already? Do these tests give you any more answers to the above questions?

Outputs:

* Write lots of 3x5 cards about which classes and methods are being suggested. Research these suggestions over the weekend.

Building your toolbox:

* Write out any libraries that are referenced in the documentation
* Write out any methods/functions that are referenced in the documentation
* Write out any built-in classes that are suggested or feel natural for the problem (eg: Hash, Array, Fixnum, String)
* Write out any `input -=> output` translations and try to group them
  * What do these groups suggest?
  * Are there any edge cases that aren't listed? Negative numbers? Empty strings?
* Are there any other methods that jump out to you?
* Are there any tactics from previous experience that might help out? You may have 3x5 cards about these topics (probably not on your first run through though).

Outputs:

* Write lots of 3x5 cards about the methods you find. There are only a few good solutions for problems. For instance, almost all String problems use gsub or scan.
* Write 3x5 cards for the groupings that you find. There are only a few groupings for each type of answer. For instance, when dealing with describing numbers, 0-12 are interesting, but the rest up to 99 all follow a similar pattern. Or when dealing with Strings, the empty string "" is very interesting.

Whiteboarding / Pseudo-code:

* In Pseudo-code, english, or on the whiteboard, write out the process you think you might follow to solve the problem
* Telling a story can be remarkably effective. We're conditioned to think about stories, not logical processes.
* Start with: input -=> magic -=> output
* Now start to whittle away at the magic from the front, then the back. When you can't whittle anymore, ask your neighbors
* Change tack, maybe your initial whittle was wrong.

Outputs:

* What tactics (patterns) are jumping out to you consistently? And which tactics are you hearing about from your neighbors? Write these on 3x5 cards to meditate on later.

Tests:

* Write out a set of instructions in English for each input/output for someone else to test
* Specify any classes, functions, and/or methods
* Specify the correct `require` in the test file
* If the problem requires `puts` or `gets` just write out: "stub gets" or "capture io" on a line above the instructions.
* There should probably be 5-10 tests for all of the warmups.

Outputs:

* Write out any testing strategies/patterns that you see repeating.
* Analyze parts of your tests that are complicated or involve repetition.
* Again, look for tactics that are coming up in the tests and jot them down on a 3x5 card. The same strategies come up over and over. There are only a couple good ways to test String-like things; learn them as soon as possible so you can assemble your toolbox.

Writing code:

* Finally, practice "evil coder" and try to make your program pass tests without actually doing the right thing. If your tests expects that some method returns 2, just make it return 2 and continue on.

Refactoring:

* Take note of the ugly parts of your code as you're writing. Now is the time to take care of these transgressions.
