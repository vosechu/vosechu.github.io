---
layout: page
body_classes: exercise metrics
page_title: Performance Metrics
title: Overview of Performance Metrics
---

Performance metrics, activities, and standards, allow us to focus in on what's actually important when we're studying. This file has been approached from the standpoint of the employer:

* **Basic skills** are those skills that are assumed to be true. When interviewing, if a candidate doesn't have these skills it can sometimes come as a shock to the interviewer. This is the baseline.
* **Intermediate skills** are the skills that start to set you apart from the rest of the candidate pool. These are skills that are learned over time and absolutely make you a better developer if you can memorize or somehow find a way to do them without thinking. If you're specializing in an area, this is the group to make sure you know 100%.
* **Advanced skills** are the skills that really set you apart and can put you in a position where you're picking from employers. These skills will often take time and research, but if you're wanting to master an area, you should be familiar. If you're specializing in an area, you should at least understand these skills and be able to implement them fairly quickly if you have access to your bookmarks.

_You should come out of the program with all of the Basics in every category._ Exams are generally confined to the basic skills and leave the intermediate and advanced skills as extra credit.

When you do stage 2 problems, keep these performance metrics in mind to focus you on results.

##{.no-break} Core Abilities

The core abilities for our program are as follows. They are designed to be the overarching goals for everything you do. Each of them have been specifically requested by the employer network and we believe that they are good goals for all developers to aspire to and flesh out.

1. Create code quickly and efficiently
2. Create high quality code
3. Collaborate with teammates effectively
4. Understand and apply the current technologies
5. Learn new technologies easily
6. Understand and apply computer science concepts
7. Speak effectively about technology in interviews and while networking
8. Can utilize the technical and functional aspects of each lesson’s topic

##{.no-break} General Performance Standards

A passing student will:
* Demonstrate 100% of the items in the basic section in less than n minutes
* Demonstrate the items in the basic section with no reference material
* Demonstrate the items in the basic section with >75% correctness
* Demonstrate >25% of the items in the intermediate section in less than <strong>n*2</strong> minutes
* Demonstrate items in the intermediate section with limited reference materials
* Submit work, which complies with common style guides for the languages involved
* Submit project work for grading that includes automated tests
* Submit project work for grading that works in the browser as well as the test suite

An excellent student will (in addition to above):
* Demonstrate >50% of the items in the intermediate section in less than <strong>n*1.5</strong> minutes
* Demonstrate >25% of the items in the advanced section in less than <strong>n*3</strong> minutes
* Demonstrate items in the advanced section with any reference materials
* Submit project work which includes elements above and beyond what is specified in the homework

# Unfinished

* Command-line
* HTML
Basic:
* Create a basic html5 boilerplate without use of a template generator
* Create a bootstrap boilerplate without the use of a template generator
* Use lists, links, tables, images, div/spans
* Create valid forms with correct action/method attributes
* Create valid forms with linked labels
* Create valid forms with inputs using the name attribute
* Use id/class attributes to identify elements

* Testing w/Ruby,JS
* OS X command-keys
* jQuery

# Finished

* Version Control
* CSS
* Middleman
* Programming fundamentals  w/Ruby,JS
* Javascript
* Sinatra
* Rails
* SQL
* Backbone.js / Ember / Angular
* Agile Methodologies
* Employment
* Open Source


## Version Control

### Target Competencies

* Ability to work on a team with other collaborators
* Mastery of Git terminology and usage
* Basic understanding of other version control systems

### Learning Objectives

Students will understand:
* How to start a new project
* Conflicts and resolution
* The benefits of various workflows
* How to use collaboration tools (like Github)

### Learning Activities

Students will:
* Start a new project by cloning
* Start a new project by init/remote add
* Use standard commit process
* Fix conflicts and push to remote repos
* Collaborate on a project using the pull request process
* Collaborate on a project as full ‘collaborators’
* Perform code review for other students on github.com

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Use the standard commit process
* Resolve simple conflicts
* Push to remotes that they cloned from
* Push to remotes for which they are a full collaborator
* Create projects through github and clone them
* Set their $EDITOR to sublime or understand how to use vi

Students at an intermediate level will be able to:
* Use pull requests to push to repos for which they are not a full collaborator
* Add, rename, and remove remotes
* Pull from other people’s forks
* Create projects locally and then add a github remote and push
* Create new branches and merge to master when needed
* Push to remote branches

Students at the advanced level will be able to:
* Use defunkt/hub to create and manage repos from the command line
* Use `git reset --hard` with confidence to time travel
* Understand how to accept pull requests
* Resolve difficult conflicts correctly
* Decide between the merge and rebase strategies

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=15</strong>
* Demonstrate the items from the basic section on a 30 minute exam

## CSS

### Target Competencies

* Familiarity with CSS sufficient to style small-scale projects
* Capable of working with a creative team to implement a properly formed style guide

### Learning Objectives


Students will understand:
* Basic CSS for layouts
* How a team uses a CSS framework
* Valid CSS syntax and code standards
* Preprocessor syntax like SCSS/SASS
* Responsive design

### Learning Activities


Students will:
* Implement a simple design using a community standard CSS framework
* Experiment with CSS layout structures
* Analyzing layouts of popular websites
* Use the Chrome inspector

### Performance Metrics


Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Include external stylesheets
* Include vendor provided frameworks
* Implement an HTML structure informed by a CSS framework or style-guide
* Use IDs and classes to reference styles in an external stylesheet
* Identify potential problems caused by inline styles
* Discuss the differences between block and inline

Students at an intermediate level will be able to:
* Use a preprocessor to create styles for a webpage
* Scope individual pages to an id or class on the body
* Use floats/inline-block to create horizontal menus or blocks of content
* Center content correctly in all modern browsers
* Find information about cross-browser compatibility of CSS3 styles

Students at the advanced level will be able to:
* Implement a design that works across modern browsers
* Implement a design from a comp
* Use responsive design to target multiple device sizes
* Apply mixins and/or includes from a preprocessor language
* Use advanced CSS3 styles while maintaining backwards compatibility

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=15</strong>
* Demonstrate the items from the basic section on a 30 minute exam

## Middleman


### Target Competencies

* Ability to create sites using Middleman
* Understanding of the reasons for using Middleman instead of something bigger
* Review HTML and determine if there are any knowledge gaps

### Learning Objectives

Students will understand:
* Why to use middleman
* How to initialize a middleman app for use on Heroku
* Basic HTML syntax (refresher)

### Learning Activities

Students will:
* Start a new middleman app
* Create layouts, pages, and include some basic assets
* Deploy the site to Heroku

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Initialize a new middleman app
* Take a premade theme and cut it into a layout and an index page
* Start the middleman server and connect to the site in a browser
* Build static assets for upload to a non-Rack capable server

Students at an intermediate level will be able to:
* Start the middleman server in live-reload mode
* Use front-matter to customize their layouts
* Deploy the completed project to Heroku

Students at the advanced level will be able to:

* Research and find new functionality on the Middleman website

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=15</strong>
* Demonstrate the items from the basic section on a 30 minute exam

## Programming Fundamentals


### Target Competencies

* Fluency with Ruby syntax and data structures
* Ability to quickly create simple solutions for small problems
* Knowledge about overall architecture sufficient to solve larger problems

### Learning Objectives

Students will understand:
* General data structures
* Control flow structures
* Object-oriented Programming
* Ruby syntax
* White-boarding
* Testing in command-line scripts
* Scoping, hoisting, shadowing

### Learning Activities

Students will:
* Perform daily warm-up exercises
* Create several larger projects in Ruby using the command-line
* Create automated tests to validate correctness of programs
* Engage in role-play exercise about domain modeling of objects

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Create new ruby files and execute them from the command line
* Create classes with instance methods and class methods
* Create scripts that use local and instance variables
* Demonstrate examples of hoisting, shadowing, and scoping, on the board
* Create tests in the same file and execute them to validate correctness of the program
* Create algorithms on the whiteboard, or in pseudo-code, for simple programming challenges
* Create and use a Gemfile in a project to manage dependencies

Students at an intermediate level will be able to:
* Create projects with multiple files linked by `require`
* Answer daily warmups in less than 10 minutes
* Understand common classes of syntax errors
* Debug logic problems
* Create projects with a directory of tests, runnable by `rake`

Students at the advanced level will be able to:
* Create new Gems and use them in projects
* Use and understand tests in multiple different dialects
* Use mocks and stubs to make tests more efficient
* Understand how to create rake or thor tasks
* Solve problems using recursion
* Solve problems using lambdas or Procs
* Understand the tradeoffs between speed and space. Be able to analyze programs to determine which optimization is being used

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=30</strong>
* Demonstrate the items from the basic section on a 60 minute exam

An excellent student will (in addition to above):
* Create readable code indicated by a low cyclomatic complexity
* Create tests to validate code instead of using `puts` or some equivalent
* Use modules or utility classes to increase reusability
* Answer daily warmups in less than 10 minutes

## Javascript


### Target Competencies

* Ability to use Javascript outside of jQuery
* Ability to use jQuery and $.ajax to support async data loading
* Understanding of JSON transport

### Learning Objectives

Students will understand:
* Javascript syntax
* Using pure Javascript libraries as well as jQuery
* Using jQuery for DOM related tasks
* Using $.ajax to load data from a RESTful JSON API server
* Understand document.ready

### Learning Activities

Students will:
* Use jQuery frequently in projects to select data from websites
* Use AJAX to pull data from a RESTful API server
* Use the Chrome debugger and inspector to debug problems with javascript
* Create a game to demonstrate their understanding of syntax

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Use JSFiddle or the Chrome inspector to test out snippets
* Link to external Javascripts from html files or layouts
* Understand where to put external scripts to ensure that the DOM is fully rendered when code is run
* Use jQuery to select items on a page and get their text or value
* Use jQuery to add a class or edit attributes on an element
* Write Javascript using Coffeescript
* Use a automatic linter/hinter to improve code quality

Students at an intermediate level will be able to:
* Create objects with attributes and methods
* Modify an object’s prototype
* Use Javascript tests to validate correctness of functionality
* Use jQuery’s $.ajax to pull information from a json API
* Use JSON-P to request information from an external API
* Understand minification and compression
* Understand and use callbacks

Students at the advanced level will be able to:
* Use event listeners and mediators
* Use scope limiters and namespacing to keep items off of the window
* Use proxies to bypass cross-domain ajax requests
* Use tests to validate ajax functionality
* Use jQuery UI to add additional functionality to their sites
* Use HTML5 apis to add additional functionality to their sites
* Research which HTML5 apis are stable and ready to use across browsers

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=30</strong>
* Demonstrate the items from the basic section on a 60 minute exam

An excellent student will (in addition to above):
* Create readable code indicated by a low cyclomatic complexity
* Use namespaces or modules to prevent window pollution
* Use a developer library (like underscore or jQuery) to produce more compact code

## Sinatra


### Target Competencies

* Ability to create and use Sinatra projects
* Able to decide whether to use Sinatra or some bigger/smaller framework

### Learning Objectives

Students will understand:
* Sinatra domain-specific language
* Framework independent routing concepts
* When to use Sinatra vs something else
* HTML templates

### Learning Activities

Students will:
* Create a project in Sinatra to store and retrieve flash cards RESTfully
* Create several small projects to practice project creation
* Create a project of their own devising for the portfolio

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Create a new Sinatra project with a config.ru and a Gemfile
* Create routes using any HTTP verb
* Create routes which can render HTML via ERb
* Return static assets from a public folder
* Use a reloader to make development faster
* Use Basic authentication

Students at an intermediate level will be able to:
* Use a preprocessor to allow SCSS or Coffeescript
* Enable HAML instead of ERb
* Create routes which can render JSON
* Use correct content-types to return JSON or XML
* Use correct status codes to communicate with the browser when responding with JSON or XML
* Use before filters to add functionality to specific urls

Students at the advanced level will be able to:
* Use Datamapper to interact with a database
* Use YAML for configuration
* Use Rack middleware to add functionality to Sinatra

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=15</strong>
* Demonstrate the items from the basic section on a 30 minute exam

## Rails

### Target Competencies

* Ability to create and use Rails projects
* Ability to decide and convince about whether to use Rails or some bigger/smaller framework
* Ability to use scaffolds, or develop without them
* Ability to use ActiveRecord comfortably

### Learning Objectives

Students will understand:
* Fluency in the Rails framework
* Deep understanding of the Rails gem/plugin ecosystem
* Scaffolding
* ActiveRecord
* The asset pipeline

### Learning Activities

Students will:
* Create several small Rails projects to practice initialization
* Practice using scaffolds to create data structures quickly
* Use scaffolds to create JSON APIs for learning Backbone
* Practice and research various gems often used with Rails

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Initialize a new project with Rails or rails-api
* Use scaffolds to create new resources and models outside of the scaffolds
* Use generic non-scaffold generators to create new resources
* Add routes to the Router
* Create a static_controller or a pages_controller for non-dynamic content
* Create SCSS and Coffeescript assets and include them in the layout
* Use and understand common Gems in the Rails ecosystem
* Use simple relationships to link models together
* Deploy projects to Heroku
* Create migrations
* Use flash and flash.now messages to send feedback to users
* Use sessions and cookies to store user data

Students at an intermediate level will be able to: (with some reference material):
* Use advanced relationships like hmt and habtm
* Use scopes, constructors, and methods to draw logic out of the controller
* Use and understanding asset manifests to combine and compress
* Implement authentication and authorization
* Implement file uploads, search, and/or caching
* Deploy projects via Capistrano
* Debug logical errors and syntax errors

Students at the advanced level will be able to (with some reference material):
* Find and debug performance issues
* Create new rake tasks
* Understand and use the many levels of caching in Rails
* Use serializers or presenters to prepare data for views

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=30</strong>
* Demonstrate the items from the basic section on a 60 minute exam

An excellent student will (in addition to above):
* Create readable code indicated by a low cyclomatic complexity
* Use tests to validate functionality in models
* Use tests to validate delegation and routing in controllers
* Discover gems that add significant functionality to Rails

## SQL


### Target Competencies

* Ability to create structures for storing data
* Ability to model data and relationships in a way conducive to use in Rails or Sinatra
* Ability to query the database directly or through a GUI

### Learning Objectives

Students will understand:
* The basics of SQL for use in the command-line interface
* The structure of databases

### Learning Activities

Students will:
* Create several tables and databases manually
* Insert and manipulate data manually
* Create Rails migrations to affect the database

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Connect to mysql or sqlite3 via the command-line
* Execute SELECT, INSERT, UPDATE, and DELETE statements from the command-line
* Understand relationships and be able to discuss on a whiteboard or pseudo-code
* Create migrations in Rails or Sinatra
* Understand ORDER and LIMIT

Students at an intermediate level will be able to:
* Understand and use the JOIN syntax
* Use EXPLAIN to understand the performance implications of a query
* Push/pull data to heroku with the Taps gem

Students at the advanced level will be able to (with some reference material):
* Connect to Postgres via the command-line
* Create key constraints in MySQL or Postgres

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=15</strong>
* Demonstrate the items from the basic section on a 30 minute exam


## Backbone.js

### Target Competencies

* Ability to create applications in Backbone.js
* Ability to link Backbone applications to central servers for data persistence

### Learning Objectives

Students will understand:
* Backbone’s version of MVC
* JSON as a transport language
* Event handling and callbacks
* The structure of backbone projects
* Navigation and routing in backbone

### Learning Activities

Students will:
* Create several backbone projects from scratch in different frameworks
* Create several backbone projects isolating the individual components of the MVC
* Create a project using an external API instead of a local server or localStorage

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Create a backbone app from scratch in multiple Ruby frameworks
* Create a backbone app from scratch with straight html and no Ruby framework
* Create models, views, and collections in one file
* Create a model-view and a list-view composed of templates or other sub-views
* Bind to DOM events and respond to clicks and submissions
* Bind to model/collection events and respond to data changes

Students at an intermediate level will be able to:
* Store models, views, and collections in multiple files rather than in app.js
* Use a mediator to communicate between objects
* Ensure that objects are getting destroyed and not becoming zombies
* Connect to a central RESTful API to fetch data for models and collections
* Use a router to enable navigation

Students at the advanced level will be able to (with some reference material):
* Use grunt to create your application
* Use ERB or Haml to prepopulate collections on load
* Use Websockets or EventSource to continually monitor models/collections
* Use RequireJS or AMD to require files
* Use localStorage instead of an API

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with <strong>n=30</strong>
* Demonstrate the items from the basic section on a 60 minute exam

## Agile Methodologies

### Target Competencies

* Ability use and guide others on Agile methodologies used during weekly iterations
* Understanding of the project beginning and end rituals

### Learning Objectives

Students will understand:
* The rituals used at all phases of a project
* The underlying purpose of each ritual

### Learning Activities

Students will:
* Brainstorm and pitch a product idea, find backers, and build a development team
* Follow all the rituals during development of their product

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Create stories in "As a User" style
* Estimate stories using planning poker
* Choose stories in an IPM
* Perform and organize daily standups

Students at an intermediate level will be able to:
* Demonstrate the completion of stories in the demo
* Organize a constructive retrospective with data before opinions
* Calculate velocity manually

### Performance Standards

A passing student will be able to:
* Perform the general performance standards without a time limit
* Demonstrate the items from the basic section on a 20 minute exam

## Employment

### Target Competencies

* Strong interviewing skills and ability to answer common tech challenges
* Ability to create an effective digital presence
* Ability to use networking skills and connections to further their employment goals

### Learning Objectives

Students will understand:
* What employers are looking for and how to discover more target skills
* How to answer difficult questions and technical challenges
* Different types of companies and some advantages/disadvantages
* The importance of a portfolio

### Learning Activities

Students will:
* Participate in several mock interviews / speed dating scenarios
* Recreate their resume
* Create a portfolio with their in-class projects
* Strengthen their digital presence on social networks and other visible websites
* Interact with open source communities and attempt to improve highly-public projects
* Give lightning talks each week
* White-board technical challenges in a low-stress environment

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Shake hands with confidence
* Present a personal sales-pitch
* Quickly explain any projects they worked on
* Answer questions about all skills listed on their resume
* Use the white-board to diagram simple tech challenges
* Answer difficult soft-skill questions

Students at an intermediate level will be able to:
* Redirect difficult soft-skill questions to positives
* Guide interviews when the interviewer is not proficient
* Give lightning talks at conferences or meetups
* Solve/work on difficult tech challenges with the interviewer (possibly pair)

Students at the advanced level will be able to (with some reference material):

* Commit open source patches

### Performance Standards

A passing student will be able to:

* Demonstrate the items from the basic section on a 20 minute exam

## Open Source

### Target Competencies

* Ability to articulate the differences between open source, FOSS, and closed-source
* Ability to navigate open source communities
* Ability to fix bugs or commit features on open source projects

### Learning Objectives

Students will understand:
* The value of Open Source and some history
* The structure of several open source communities or archetypes
* Use version control appropriate to the project

### Learning Activities

Students will:
* Validate a bugfix/feature for a community member in class
* Create documentation fixes for prominent open source projects

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Create documentation fixes
* Validate bugfixes/features for community members
* Discuss features that have been proposed
* Identify key contributors and maintainers

Students at an intermediate level will be able to:
* Create bugfixes and have them accepted to the project
* Perform code review or security audits on patches
* Identify small bugs for new community members to try out

Students at the advanced level will be able to (with some reference material):

* Create small features and have them accepted to the project

### Performance Standards

A passing student will be able to:

* Demonstrate the items from the basic section on a 20 minute exam
