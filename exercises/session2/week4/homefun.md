---
layout: page
body_classes: exercise
title: Week 4 &mdash; Homefun
---

### Main project

Making jQuery and Javascript plugins with tests

Step 1:

Give navbar items an active class if the url matches their link.

* Create a page with a bootstrap navbar
* If the link in the navbar is the same as the url of the page, add the class 'active' to the nearest li.
* Expand this by supporting nested lists, if a sublist item is active, also add the active class to the parent list item.
* You shouldn't need to support more than one level deep but consider what you might do to enable that.
* Reserve half the exercise time to write tests afterwards.

Reflection activity:

* This is an incredibly common activity that you'll do on almost every single site. How can you wrap up the functionality to be useful later on?
* If you didn't put all the code in a function to begin with, did you have to once you started testing?

Step 2:

jQuery UI modal dialogs with auto-pop based on the URL.

* Implement bootstrap-modal dialogs when you click on a button.
* If there's anything in the queryhash (the bit after the #), look for an element with that id. If you find an element with that id trigger a click on it.
* This is super useful for theming modals and very important for most sites that use modals or popup dialogs.

Reflection activity:

* Modal and popup dialogs are also incredibly common, but they present problems for people that try to theme them. This is a hidden state and often needs extra logic to expose it for manual testing or for theming. What other hidden states are there on websites and how do you think they're verified or styled?

Step 3:

Implementing and spying on tooltips

* Implement bootstrap tour to guide people through using the site the first time
* Using fixtures do unit tests to ensure that the first time fixture loads it starts the tour
* Using a real page, validate that on the first load the tour begins

Reflection activity:

* This is fairly common for web products, but since we're just in javascript land, how do we ensure that the next time someone visits the site they won't be shown the tour again?
* Give an answer that would involve technology as well as one that would require educating or encouraging the user to act differently than they did the first time they hit the page in question.

Step 4:

Implementing the bootstrap carousel and responding to slide events

* Implement the bootstrap carousel
* Underneath the carousel, also implement bootstrap tabs
* When the carousel slides, select the next tab of content as well
* Make sure to unit test the functionality in isolation, that when the event 'slide' gets thrown, that the correct tab gets selected
* Make sure to also do an integration test confirming that the carousel on the actual html page controls the tabs.

Reflection activity:

* Why is this a terrible idea?
* How would you overcome the terribleness (don't actually implement it though). What would you recommend to your client?

Step n:

All of these things are also important to try to implement and test

Datepickers
Accordions
jQuery.validate
Yellow border on any links that are still #pending (my frontender would make links point at #pending so that he could search through the codebase, but I would still forget about them so I colored them all bright yellow)
Lightbox/Colorbox popup galleries

## Monday
### Reading to do before class

* [Intro to Jasmine](http://net.tutsplus.com/tutorials/javascript-ajax/testing-your-javascript-with-jasmine/)
* [Official docs (skim)](http://pivotal.github.io/jasmine/)

### Reading questions due before class

* When you think about testing javascript, what use cases come to mind? Are they different from ruby?
* Is jasmine a unit test framework or an integration test framework?
* How do you set up a basic jasmine runner? What boilerplate is needed?
* If `it` roughly corresponds with an individual test, what does `describe` correspond with?
* How do you test equality?
* What is the equivalent to setup/teardown?

### Resources

## Tuesday
### Reading to do before class

* [More advanced Jasmine](http://evanhahn.com/how-do-i-jasmine/)
* [Another Jasmine tutorial](http://a-developer-life.blogspot.com/2011/06/jasmine-part-2-spies-and-mocks.html)

### Reading questions due before class

* What is a test spy? Is it closer to a mock or a stub? Or neither?
* How do you use a spy to facilitate the concept of mocking?
* Why would we watch objects to find out if certain functions have been called?
* What are the use cases for mocks in Javascript? Are they different from Ruby?

### Resources

## Wednesday
### Reading to do before class

* [Jasmine-jquery docs](https://github.com/velesin/jasmine-jquery)
* [Jasmine-fixtures docs](https://github.com/searls/jasmine-fixture)

### Reading questions due before class

* What is a fixture
* What is the purpose of providing a fixture as opposed to including jasmine in our website's main layout if we want to test jQuery?
* What problem is jasmine-fixture trying to fix over jasmine-jquery?

### Resources

## Thursday
### Reading to do before class

* [Jasmine official docs (esp async section)](http://pivotal.github.io/jasmine/)
* [Jasmine async wiki](https://github.com/pivotal/jasmine/wiki/Asynchronous-specs)
* [Sinon.js docs](http://sinonjs.org/)
* [Jasmine-sinon docs](https://github.com/froots/jasmine-sinon)

### Reading questions due before class

* What is an asynchronous event and why is this a problem that jasmine even needs to solve?
* How do you make jasmine wait for asynchronous events to happen?
* If you didn't want to actually make the ajax connection, how would you prevent jQuery from actually calling out to a server?
* If you didn't actually have a server, but you wanted ajax to continue, how could you do that with Sinon.js?
* How does Sinon.js differ from Jasmine's built in spies?

### Resources