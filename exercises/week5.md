---
layout: page
body_classes: exercise
---

## Week 5 &mdash; Overview
### Monday Stuff
* Announcements
* Network points awards
* Networking events for the week
* Call for lightning talks

### Monday comprehension questions

### Weekly Topics
* Sinatra Basics
* OOP principles and Object modeling
* SQL and Data modeling
* jQuery & Coffeescript

### Weekly Theme

### Weekly Home<del>work</del>**fun**
* Email me a link to your 5th Blog post. 1-2 pages (500-1000 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.

## Monday &mdash; 3/4/2013
### Topics
* Sinatra

### Goals
* Understand Sinatra, routing, and templates

### Definitions
* Sinatra: Sinatra is a DSL for quickly creating web applications in Ruby with minimal effort
* Route: A route is an HTTP method paired with a URL-matching pattern.
* Template: A template is a generic HTML file with some way to allow you to insert context-appropriate data directly. The most common is the layout file.

### Important Threshold Concepts

### Reading to do before class
* [Sinatra README](http://www.sinatrarb.com/intro.html)
* [ERB README](http://ruby-doc.org/stdlib-2.0/libdoc/erb/rdoc/ERB.html)

### Resources
* [EventSource JS Object](https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events)
* [Original chat app by rkh (not working anymore)](https://gist.github.com/rkh/1476463)
* [Sinatra-contrib](http://www.sinatrarb.com/contrib/)

### Helpful Commands
{% highlight bash %}
gem install sinatra-gen

# Generate the project. --tiny uses 'classic' sinatra
sinatra-gen sinatra-long-poll --tiny --test=spec --views=erb get:/subscribe post:/message

# Start the server properly
RACK_ENV=development be ruby sinatra-long-poll.rb
{% endhighlight %}

{% highlight ruby %}
require 'erb'
# Compile the template (but don't fill in the values yet)
template = ERB.new "The value of x is: <%= @x %>"

# Prepare the values for inclusion in ERB
@x = 42

# Use the variables in the current scope and pass them to `result`
puts template.result(binding) #=> The value of x is: 42
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your group
  * What is Sinatra
  * What is a route
  * What is a named parameter
  * What is a splat parameter
  * What is a template
  * What folder can I put static assets in
  * How do you use an ERb file
  * Where is the default layout file located
  * How do you specify a non-default layout
  * How do you pass variables to the template
  * How do you redirect to another page

#### Stage 2 (application/analyzing)

* I've built a chat script but it has a couple bugs and it's missing some features
* Start off by getting the app running.
* In a small group, try to tackle each of the TODOs. Brainstorm them first and make sure you understand the problem.
* Make sure that you can access each other's chat room.

#### Boss Fight (evaluation/creation)

* Rather than relying on params for the username, rely on a session
* Add in Rack::Test to ensure that at least the first couple of routes are working. Don't test the long-polling stuff.
* Add in a rake task to send a POST for manual testing

## Tuesday &mdash; 3/5/2013
### Topics
* Object-oriented Programming (OOP)
* Law of Demeter
* Responsibility-driven Design

### Goals
* Understand Dynamic dispatch, encapsulation, inheritance/delegation, open recursion (this/self)
* Understand Law of Demeter / Responisibilty-driven Design

### Important Concepts
* Things (objects/nouns) vs actions (methods/verbs)

### Reading to do before class
* [Object-oriented Programming for non-tech users](http://programmers.stackexchange.com/a/34588/5942)
* [Object-oriented Design Process](http://stackoverflow.com/a/1101138/203731)

### Resources
* [CRC Cards](http://en.wikipedia.org/wiki/Class-responsibility-collaboration_card)
* [Law of Demeter](http://en.wikipedia.org/wiki/Law_of_Demeter)
* [Object-oriented Design](http://en.wikipedia.org/wiki/Object-Oriented_Programming#Fundamental_features_and_concepts)
* [Responsibility-driven Design](http://en.wikipedia.org/wiki/Responsibility-driven_design)

### Exercises

#### Stage 0

* Find a hat. Inside that hat will be instructions.

#### Stage 1 (remembering/understanding)

* Pair these statements
  * Each unit should have only limited knowledge about other units
  * Each unit should only talk to its friends; don't talk to strangers
  * What actions is this object responsible for?
  * What information does this object share?
  * When a method is invoked on an object, the object itself determines what code gets executed
  * The creation of self-contained modules that bind processing functions to their data.
  * "x" Enforces Modularity
  * Classes are created in hierarchies, and "x" allows the structure and methods in one class to be passed down the hierarchy.
  * "x" Passes "Knowledge" Down
  * A special variable (syntactically it may be a keyword), usually called this or self, that allows a method body to invoke another method body of the same object.

* With these philosophies or concepts
  * Law of Demeter
  * Responsibility-driven Design
  * Dynamic Dispatch
  * Encapsulation
  * Inheritance/Delegation
  * Open Recursion

#### Stage 2 (application/analyzing)

* In your group, map out the Stage 0 project on paper. You can use CRC style or whatever makes sense to your group.
* Using the project you selected on Monday, analyze the project and make CRC cards or map out how the models are going to interact. You don't have to get it right.

#### Boss Fight (evaluation/creation)

* Research prototype-style hierarchies and compare them with Object-oriented hierarchies. They share a lot in common, but it's the differences that are interesting.
* Start building your models in Sinatra and how they interact with each other.

## Wednesday &mdash; 3/6/2013
### Topics
* Databases, SQL
* Datamapper
* Normalization

### Goals
* Understand RDBMS structures: database, table, row, column
* Understand select, where, and easy joins
* Interact with the database on command line, through an ORM, and through a GUI

### Definitions
* Database normalization: The process of organizing the fields and tables of a relational database to minimize redundancy and dependency.

### Reading to do before class
* [Select Tutorial](http://sqlzoo.net/wiki/SELECT_basics)
* [Select Assessment](http://sqlzoo.net/wiki/SELECT_from_BBC_Tutorial)
* [Join Tutorial (Music DB)](http://sqlzoo.net/wiki/Music_Tutorial)
* [Should I normalize?](http://databases.about.com/od/specificproducts/a/Should-I-Normalize-My-Database.htm)

### Resources
* [(MySQL GUI) Sequel Pro.app](http://www.sequelpro.com/)
* [(SQLite3 GUI) Base 2.app](http://menial.co.uk/base/)
* [(Postgres GUI) Navicat Essentials](http://download2.navicat.com/download/navicatess101_pgsql_en.dmg)
* [BCrypt-ruby for user passwords](http://bcrypt-ruby.rubyforge.org/)
* [SQL Videos @ Lynda.com](http://www.lynda.com/SQL-tutorials/essential-training/769-2.html)
* [Object-relational impedance mismatch](http://en.wikipedia.org/wiki/Object-Relational_impedance_mismatch)
* [Database Normalization (Wikipedia)](http://en.wikipedia.org/wiki/Database_normalization)

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your group
  * What is a database, a table, a row, and a column
  * What is normalization
  * What is CRUD
  * How do selects work
  * How do joins work
  * How do where clauses work

#### Stage 2 (application/analyzing)

* Project
  * Take a look at your project from Monday and write out the tables and data that you might store in the db
  * Don't start on the project yet, just practice thinking through the database needs
  * Make sure that your database is in third normal form (3NF)

* In class
  * Using the datamapper config from last week, create an object for a user with a username and a password
  * When a user logs in to your chat app, check the database to ensure that their username and password match
  * Use BCrypt to store and check the password of a user

#### Boss Fight (evaluation/creation)

* Go farther with the chat database and start storing chat messages associated with a user.
* Create an index page of all things a user has said
* Move on to working on your project

## Thursday &mdash; 3/7/2013
### Topics
* jQuery and Coffeescript

### Goals
* Learn the important bits about jQuery
* Get coffeescript compiling in Sinatra

### Important Threshold Concepts

### Reading to do before class

### Resources

### Helpful Commands
{% highlight bash %}
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your group

#### Stage 2 (application/analyzing)

#### Boss Fight (evaluation/creation)

## Friday &mdash; 3/8/2013
* Wrapping it all up
* Retrospective
* Code review
* 1-on-1’s / Catchup time
* Networking points report
* Go
* Teambuilding