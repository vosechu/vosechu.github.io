---
layout: page
body_classes: exercise
title: Week 4 &mdash; Overview
---

### Monday Stuff
* How was the weekend?
* Announcements
* Network points awards
* Networking events for the week
* Call for lightning talks

### Monday comprehension questions
* What is hoisting?
* What does it mean to be functionally scoped?
* What are the three things returned by a Rack app (or any CGI server)?
* What is the command we use to run a config.ru?
* What is the difference between a class method and an instance method?
* How do I know what tests to write?
* What is markdown? Why do we use it?
* What is a template engine?

### Weekly Topics
* Sinatra and APIs
* Regexes
* Javascript: AJAX and jQuery
* Exam

### Weekly Theme
* Creating a Sinatra API backed Javascript site
* Exam covering all topics in previous 4 weeks

### Weekly Home<del>work</del>**fun**
* Email me a link to your 4th Blog post. 1-2 pages (500-1000 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* Email me a link to where you feature your javascript backed site on your portfolio

## Monday &mdash; 2/25/2013
### Topics
* Sinatra
* APIs and JSON

### Goals
* Build a RESTful Sinatra app capable of managing study questions
* Understand what a JSON API is and why we use them
* Understand REST
* Use curl/browser to ping your JSON API

### Notes
* We're going to try to ignore DataMapper and just use it without understanding for now

### Important Threshold Concepts
* What is an API
* What is REST

### Reading to do before class
* [My example project. It should look a lot like Rack](https://github.com/vosechu/corkboard_server_example)
* [Updated example project with better style](https://github.com/oisin/corkboard_server_example)
* [Slides about REST](http://www.slideshare.net/oisin/simple-rest-services-with-sinatra)
* [DataMapper tutorial (up to minute 11)](http://net.tutsplus.com/tutorials/ruby/ruby-for-newbies-working-with-datamapper/)
* [Sinatra Intro](http://www.sinatrarb.com/intro.html)

### Resources
* [http://en.wikipedia.org/wiki/SQLite3](http://en.wikipedia.org/wiki/SQLite3)
* [http://www.sinatrarb.com/documentation](http://www.sinatrarb.com/documentation)
* [http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5)
* [http://menial.co.uk/base/](http://menial.co.uk/base/)
* [http://en.wikipedia.org/wiki/Object-relational_mapping](http://en.wikipedia.org/wiki/Object-relational_mapping)

### Helpful Commands
{% highlight bash %}
bundle
rackup

ruby tests/corkboard_test.rb
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your pair
  * Read through Chuck's example, what don't you understand yet? What do you understand?
  * What is REST? Does it have to use JSON or could it use YAML or XML?
  * What is an API? Is it a superset or a subset of REST? (Draw a picture)
  * How is Sinatra different from Rack?
  * What files are needed for Sinatra?

#### Stage 2 (application/analyzing)

* Building the API:
  * Make a new repo on github with these files: `config.ru, app.rb, Gemfile, README.md, tests/app_test.rb`
  * Make a route /catscatscats which shows at least 3 cat pictures on a page.
  * Now generate the 4 verbs, get, post, put, and delete as well as an index (which is also a get)
  * In get, post, and delete use the symbol :id in the route.
  * Generate a Quiz object and give it some properties. When you restart rack make sure that you see the tables and attributes in Base.app.
  * Using `params[:id]`, use DataMapper to find the quiz with that id.
  * Try to figure out how to make all 5 of these new routes work and respond with a json object.
  * Push your attempts to Github.

#### Boss Fight (evaluation/creation)

* Using Rack::Test try to evaluate whether your 5 routes are working
* Look through RFC-2616 and decide whether I've gotten my status codes correct in the sample app.
* Make your `/cats[cats[cats]]` route show the same number of cats as words in the url bar.

## Tuesday &mdash; 2/26/2013
### Topics
* AJAX through jQuery
* Object Oriented Javascript

### Goals
* To connect to the Quiz backend and display the quizzes on a page.
* To understand AJAX
* To grasp a little bit of jQuery and how it uses CSS selectors
* To make reasonable Object Oriented Javascript

### Notes
* We're going to try to ignore most of jQuery and just use its AJAX components. We'll cover more jQuery next week.

### Important Threshold Concepts
* Function Callbacks
* Single Origin Policy / JSON-P / CORS

### Reading to do before class
* [http://ejohn.org/apps/learn/#64](http://ejohn.org/apps/learn/#64)
* [http://teamtreehouse.com/library/websites/build-an-interactive-website/introduction-to-jquery](http://teamtreehouse.com/library/websites/build-an-interactive-website/introduction-to-jquery)
* [http://teamtreehouse.com/library/treehouse-workshops/programming-stepbystep-objectoriented-javascript-part-1](http://teamtreehouse.com/library/treehouse-workshops/programming-stepbystep-objectoriented-javascript-part-1)
* [http://jqfundamentals.com/](http://jqfundamentals.com/)
* [http://lupomontero.com/screencast-fetching-tweets-with-jquery-and-the-twitter-json-api/](http://lupomontero.com/screencast-fetching-tweets-with-jquery-and-the-twitter-json-api/)

### Resources
* [https://github.com/vosechu/pcs_examples/tree/master/week4](https://github.com/vosechu/pcs_examples/tree/master/week4)
* [http://stackoverflow.com/questions/3506208/jquery-ajax-cross-domain](http://stackoverflow.com/questions/3506208/jquery-ajax-cross-domain)
* [http://devlicio.us/blogs/scott_seely/archive/2010/09/07/how-jsonp-works-and-some-bits-about-implementing-it-in-wcf.aspx](http://devlicio.us/blogs/scott_seely/archive/2010/09/07/how-jsonp-works-and-some-bits-about-implementing-it-in-wcf.aspx)

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your pair

  * General jQuery

    * How do you make an ajax request through jQuery?
    * How do I find an element with jQuery?
    * How do I hide and show elements with jQuery?
    * How do I add a click handler in jQuery?
  * General Javascript
    * How do Constructors work in Javascript?
    * How do I define methods on an object?
    * What is `"use strict";` in Javascript?
    * What is a Linter? How do you install the SublimeLinter package?
  * Ajax and cross-domain requests
    * What is CORS and why isn't it in use?
    * What is JSON-P and why does it only work for GET?
    * What is server-side proxying and what are its pitfalls?
    * So what's the point if AJAX only works on the same domain?!

#### Stage 2 (application/analyzing)

* Adding Javascript Objects:
  * Open up your quiz application from yesterday and add a public folder
  * Add an index.html and a app.js into the public folder
  * Add in a doctype and the necessary boilerplate to load up your javascript file
  * In your javascript file add in a Quiz object with the same attributes as your sinatra app from yesterday.
* Connecting to your Sinatra API:
  * In your javascript file, add in prototypes for fetch and save.
  * In each of these functions, use jQuery to connect through ajax
  * Fetch should override all attributes that are returned
  * Save should use PUT if the object is new, POST if it's already got an `id`.
  * When you do save, make sure to save the id so we don't PUT again.

#### Boss Fight (evaluation/creation)

* Begin researching Backbone.js to get ideas about how to make the app from Stage 2 better.

## Wednesday &mdash; 2/27/2013
### Continuation of Tuesday exercises

TODO insert exercise from Cole

## Thursday &mdash; 2/28/2013
### Topics
* Exam day (open google)

## Friday &mdash; 3/1/2013
* Wrapping it all up
* Retrospective
* Code review
* 1-on-1’s / Catchup time
* Networking points report
* Go
* Teambuilding