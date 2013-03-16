---
layout: page
body_classes: exercise
title: Week 7 &mdash; Overview
---

### Monday Stuff
* How was the weekend?
* Announcements
* Network points awards
* Networking events for the week
* Call for lightning talks

### Monday comprehension questions
* What projects are good for Middleman?
* What projects are good for Jekyll?
* What projects are good for Sinatra?
* What projects are good for Rails?
* What projects are good for Wordpress/Drupal?
* What projects are good for single page Javascript sites?
* What is a JSON API Server?
* What is an API Server?
* What is a Server?
* What does the Rails asset pipeline do?
* What is rake?
* What is the difference between `match` and `resources` in `config/routes.rb`

### Weekly Topics
* Rails Practice
* Introducing rails-api (Routing, asset pipeline, mvc)
* Testing in Rails (controllers, unit, mock, stub, assertions)
* Introduction to Backbone.js

### Weekly Theme
* Practicing Rails and finishing the portfolio

### Weekly Home<del>work</del>**fun**
* Email me a link to your 7th Blog post. 1-2 pages (250-500 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* Submit 2 Pull requests for the cards against humanity app.

## Monday &mdash; 3/18/2013
### Topics
* Practicing rails
* Issue queues in open source projects
* Pull requests (upstream vs origin)

### Goals
* Gain greater confidence in Rails
* Understand how to create a pull request for an open source project

### Reading to do before class

### Resources
* [_The_ book on running an open source project](http://producingoss.com/en/producingoss.html)
* [Open Source Rails (list of rails projects that need help)](http://www.opensourcerails.com/)
* [OpenHatch small bug repository](https://openhatch.org/)
* [OpenHatch Ruby list](https://openhatch.org/search/?q=&language=Ruby)

### Helpful Commands
{% highlight bash %}
# Github extensions for doing pull requests, etc. from command-line
brew install hub
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * What is the model's _main_, single responsibility?
  * What is the controller's main responsibility?
  * What is a scaffold?
  * What command do we use to create a scaffold?
  * What do these rake commands do: `rake db:create db:migrate db:seed`

#### Stage 2 (application/analyzing)

* Individually, with a pair, or in a group
  * Go on the issue thread and comment on an issue you want to do
  * Fix it and send in a pull request
  * Convince someone to sign off on your pull request
  * Convince me to accept your pull request

## Tuesday &mdash; 3/19/2013
### Topics
* Introduction to rails-api
* Further bug squashing on Cards Against Humanity app

### Goals
* Gain greater confidence in Rails
* Understand why we might use rails-api instead of sinatra or Rails

### Reading to do before class
* [Rails-api README](https://github.com/rails-api/rails-api)

### Exercises

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * In salespitch form: what is rails-api?
  * Pick 3 things from the middleware layer of Rails that affect you when you develop.
  * Pick 3 things from the ActionPack layer of Rails that affect you when you develop.
  * How do you initialize a new project from the command-line using rails-api?
  * Who are the three maintainers and what other important projects do they maintain?

#### Stage 2 (application/analyzing)

* Individually, with a pair, or in a group
  * Go on the issue thread and comment on an issue you want to do
  * Fix it and send in a pull request
  * Convince someone to sign off on your pull request
  * Convince me to accept your pull request

## Wednesday &mdash; 3/20/2013
### Topics
* Testing in Rails w/Rspec
* Factories

### Goals
* Understand the difference between unit and functional tests in Rails
* Understand the argument between fixtures, stubs/mocks, and factories
* Understand test philosophies: No testing, verification tests, test first, Strict TDD

### Important Threshold Concepts

### Reading to do before class
* [Treehouse Rails Testing](http://teamtreehouse.com/library/programming/build-a-simple-ruby-on-rails-application/writing-tests)
* [Testing in Rails (Chapters 1,2,3,4)](http://guides.rubyonrails.org/testing.html)

### Additional reading resources
* [Rails Testing for Zombies](http://rtfz.codeschool.com/levels/1)

### Resources
* [RSpec Rails (test/unit replacement)](https://github.com/rspec/rspec-rails)
* [Factory_girl (fixture replacement)](https://github.com/thoughtbot/factory_girl)

### Helpful Commands
{% highlight bash %}
# Run test/unit style tests
rake test

# Run rspec style tests
rake spec

# Make rspec the default
# Add this to Gemfile:
# group :test, :development do
#   gem "rspec-rails", "~> 2.0"
# end
rails generate rspec:install
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * Why do we test?
  * How are all test files named?
  * Where do unit tests live in Rails?
  * What is an assertion?
  * Ideally, how many assertions should we have per test case?
  * What is "red, green, refactor"?

#### Stage 2 (application/analyzing)

* Individually, with a pair, or in a group
  * Add unit tests to the cards against humanity app
  * Add functional tests to the cards against humanity app

## Thursday &mdash; 3/21/2013
### Topics
* Introduction to Backbone.js

### Goals
* Understand what a backbone model, view, and collection are

### Important Threshold Concepts
* Contract: If you call `model#fetch` or `collection#fetch`, the website MUST react correctly.

### Reading to do before class
* (Watch all of these videos, follow along)
* [Treehouse Master Class: Backbone Models](http://teamtreehouse.com/library/html5-mobile-web-applications/html5-mobile-javascript-introduction-to-backbone-and-models)
* [Treehouse Master Class: Backbone Views](http://teamtreehouse.com/library/html5-mobile-web-applications/html5-mobile-javascript-creating-the-form-view)
* [Treehouse Master Class: Backbone Collections](http://teamtreehouse.com/library/html5-mobile-web-applications/html5-mobile-javascript-backbone-collections)

### Resources
* [Backbone\'s API docs](http://backbonejs.org/)
* [Backbone\'s annotated source](http://backbonejs.org/docs/backbone.html)
* [Underscore\'s API docs](http://underscorejs.org/)
* [Underscore\'s annotated source](http://underscorejs.org/docs/underscore.html)
* [Original Backbone source for treehouse](http://thinkvitamin.s3.amazonaws.com/membership/code-samples/html5-masterclass-Code-After-MC07.zip)
* [Chuck's implementation of treehouse video (check branches)](https://github.com/vosechu/treehouse_backbone_example)

### Exercises

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * In Backbone.js, what is a Model? What are its responsibilities? Who are its collaborators?
  * In Backbone.js, what is a View? What are its responsibilities? Who are its collaborators?
  * In Backbone.js, what is a Collection? What are its responsibilities? Who are its collaborators?
  * How is the view in backbone different from the view in Rails?
  * Why don't we have a collection object in Rails? Should we?

#### Stage 2 (application/analyzing)

* Instead of using localStorage, create a Rails or rails-api app that receives saves from the model or the collection

## Friday &mdash; 3/22/2013
* Wrapping it all up
* Quiz
* Retrospective
* Code review
* 1-on-1’s / Catchup time
* Networking points report
* Go
* Teambuilding