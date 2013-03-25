---
layout: page
body_classes: exercise overview
---
## Version Control

### Target Competencies

Ability to work on a team with other collaborators
Mastery of Git terminology and usage
Basic understanding of other version control systems

### Learning Objectives

Students will understand:
How to start a new project
Conflicts and resolution
The benefits of various workflows
How to use collaboration tools (like Github)

### Learning Activities

Students will:
Start a new project by cloning
Start a new project by init/remote add
Use standard commit process
Fix conflicts and push to remote repos
Push to an out-of-date repo
Collaborate on a project using the pull request process
Collaborate on a project as full ‘collaborators’
Perform code review for other students on github.com
Complete readings on the topic
Use often in projects and other activities

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
* Perform the general performance standards with n=15
* Demonstrate the items from the basic section on a 30 minute exam

## CSS

### Target Competencies

Familiarity with CSS sufficient to style small-scale projects
Capable of working with a creative team to implement a properly formed style guide

### Learning Objectives


Students will understand:
Basic CSS for layouts
How a team uses a CSS framework
Valid CSS syntax and code standards
Preprocessor syntax like SCSS/SASS
Responsive design

### Learning Activities


Students will:
Implement a simple design using a community standard CSS framework
Experiment with CSS layout structures
Analyzing layouts of popular websites
Use the Chrome inspector

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
* Perform the general performance standards with n=15
* Demonstrate the items from the basic section on a 30 minute exam

## Middleman


### Target Competencies

Ability to create sites using Middleman
Understanding of the reasons for using Middleman instead of something bigger
Review HTML and determine if there are any knowledge gaps

### Learning Objectives

Students will understand:
Why to use middleman
How to initialize a middleman app for use on Heroku
Basic HTML syntax (refresher)

### Learning Activities

Students will:
Start a new middleman app
Create layouts, pages, and include some basic assets
Deploy the site to Heroku

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
* Perform the general performance standards with n=15
* Demonstrate the items from the basic section on a 30 minute exam

## Programming Fundamentals


### Target Competencies

Fluency with Ruby syntax and data structures
Ability to quickly create simple solutions for small problems
Knowledge about overall architecture sufficient to solve larger problems

### Learning Objectives

Students will understand:
General data structures
Control flow structures
Object-oriented Programming
Ruby syntax
White-boarding
Testing in command-line scripts
Scoping, hoisting, shadowing

### Learning Activities

Students will:
Perform daily warm-up exercises
Create several larger projects in Ruby using the command-line
Create automated tests to validate correctness of programs
Engage in role-play exercise about domain modeling of objects

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
* Perform the general performance standards with n=30
* Demonstrate the items from the basic section on a 60 minute exam

An excellent student will (in addition to above):
* Create readable code indicated by a low cyclomatic complexity
* Create tests to validate code instead of using `puts` or some equivalent
* Use modules or utility classes to increase reusability
* Answer daily warmups in less than 10 minutes

## Javascript


### Target Competencies

Ability to use Javascript outside of jQuery
Ability to use jQuery and $.ajax to support async data loading
Understanding of JSON transport

### Learning Objectives

Students will understand:
Javascript syntax
Using pure Javascript libraries as well as jQuery
Using jQuery for DOM related tasks
Using $.ajax to load data from a RESTful JSON API server
Understand document.ready

### Learning Activities

Students will:
Use jQuery frequently in projects to select data from websites
Use AJAX to pull data from a RESTful API server
Use the Chrome debugger and inspector to debug problems with javascript
Create a game to demonstrate their understanding of syntax

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
* Perform the general performance standards with n=30
* Demonstrate the items from the basic section on a 60 minute exam

An excellent student will (in addition to above):
* Create readable code indicated by a low cyclomatic complexity
* Use namespaces or modules to prevent window pollution
* Use a developer library (like underscore or jQuery) to produce more compact code

## Sinatra


### Target Competencies

Ability to create and use Sinatra projects
Able to decide whether to use Sinatra or some bigger/smaller framework

### Learning Objectives

Students will understand:
Sinatra domain-specific language
Framework independent routing concepts
When to use Sinatra vs something else
HTML templates

### Learning Activities

Students will:
Create a project in Sinatra to store and retrieve flash cards RESTfully
Create several small projects to practice project creation
Create a project of their own devising for the portfolio

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* Create a new Sinatra project with a config.ru and a Gemfile
* Create RESTful routes and respond with HTML
* Return static assets from a public folder
* Use a reloader to make development faster
* Use Basic authentication

Students at an intermediate level will be able to:
* Use a preprocessor to allow SCSS or Coffeescript
* Enable HAML instead of ERb
* Use correct content-types to return JSON or XML
* Use correct status codes to communicate with the browser when responding with JSON or XML
* Use before filters to add functionality to specific urls

Students at the advanced level will be able to:
* Use Datamapper to interact with a database
* Use YAML for configuration
* Use Rack middleware to add functionality to Sinatra

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=15
* Demonstrate the items from the basic section on a 30 minute exam

## Rails

### Target Competencies

Ability to create and use Rails projects
Ability to decide and convince about whether to use Rails or some bigger/smaller framework
Ability to use scaffolds, or develop without them
Ability to use ActiveRecord comfortably

### Learning Objectives

Students will understand:
Fluency in the Rails framework
Deep understanding of the Rails gem/plugin ecosystem
Scaffolding
ActiveRecord
The asset pipeline

### Learning Activities

Students will:
Create several small Rails projects to practice initialization
Practice using scaffolds to create data structures quickly
Use scaffolds to create JSON APIs for learning Backbone
Practice and research various gems often used with Rails

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

Students at an intermediate level will be able to: (with some reference material):
* Use advanced relationships like hmt and habtm
* Use scopes, constructors, and methods to draw logic out of the controller
* Use and understanding asset manifests to combine and compress
* Implement authentication and authorization
* Implement file uploads, search, and/or caching
* Deploy projects via Capistrano
* Debug logical errors and syntax errors

Students at the advanced level will be able to: (with some reference material):
* Find and debug performance issues
* Create new rake tasks
* Understand and use the many levels of caching in Rails
* Use serializers or presenters to prepare data for views

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=30
* Demonstrate the items from the basic section on a 60 minute exam

An excellent student will (in addition to above):
* Create readable code indicated by a low cyclomatic complexity
* Use tests to validate functionality in models
* Use tests to validate delegation and routing in controllers
* Discover gems that add significant functionality to Rails

## SQL


### Target Competencies

Ability to create structures for storing data
Ability to model data and relationships in a way conducive to use in Rails or Sinatra
Ability to query the database directly or through a GUI

### Learning Objectives

Students will understand:
The basics of SQL for use in the command-line interface
The structure of databases

### Learning Activities

Students will:
Create several tables and databases manually
Insert and manipulate data manually
Create Rails migrations to affect the database

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

Students at the advanced level will be able to: (with some reference material):
* Connect to Postgres via the command-line
* Create key constraints in MySQL or Postgres

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=15
* Demonstrate the items from the basic section on a 30 minute exam


## Backbone.js


### Target Competencies

Ability to create applications in Backbone.js
Ability to link Backbone applications to central servers for data persistence

### Learning Objectives

Students will understand:
Backbone’s version of MVC
JSON as a transport language
Event handling and callbacks
The structure of backbone projects

### Learning Activities

Students will:
Create several backbone projects from scratch in different frameworks
Create several backbone projects isolating the individual components of the MVC
Create a project using an external API instead of a local server or localStorage

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

Students at the advanced level will be able to: (with some reference material):
* Use grunt to create your application
* Use ERB or Haml to prepopulate collections on load
* Use Websockets or EventSource to continually monitor models/collections
* Use RequireJS or AMD to require files
* Use localStorage instead of an API

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=30
* Demonstrate the items from the basic section on a 60 minute exam

## Agile Methodologies


### Target Competencies

Ability use and guide others on Agile methodologies used during weekly iterations
Understanding of the project beginning and end rituals

### Learning Objectives

Students will understand:
The rituals used at all phases of a project
The underlying purpose of each ritual

### Learning Activities

Students will:
Brainstorm and pitch a product idea, find backers, and build a development team
Follow all the rituals during development of their product

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* h

Students at an intermediate level will be able to:
* h

Students at the advanced level will be able to: (with some reference material):
* h

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=10
* Demonstrate the items from the basic section on a 20 minute exam

## Employment


### Target Competencies

Strong interviewing skills and ability to answer common tech challenges
Ability to create an effective digital presence
Ability to use networking skills and connections to further their employment goals

### Learning Objectives

Students will understand:


### Learning Activities

Students will:


### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* h

Students at an intermediate level will be able to:
* h

Students at the advanced level will be able to: (with some reference material):
* h

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=10
* Demonstrate the items from the basic section on a 20 minute exam


## Open Source


### Target Competencies

Ability to articulate the differences between open source, FOSS, and closed-source
Ability to navigate open source communities
Ability to fix bugs or commit features on open source projects

### Learning Objectives

Students will understand:


### Learning Activities

Students will:

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* h

Students at an intermediate level will be able to:
* h

Students at the advanced level will be able to: (with some reference material):
* h

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=10
* Demonstrate the items from the basic section on a 20 minute exam

## Queueing


### Target Competencies

Ability to use Queues to pass messages to other systems
Ability to use Queues to advertise existence of new services

### Learning Objectives

Students will understand:


### Learning Activities

Students will:


### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* h

Students at an intermediate level will be able to:
* h

Students at the advanced level will be able to: (with some reference material):
* h

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=10
* Demonstrate the items from the basic section on a 20 minute exam

## Linux


### Target Competencies

Ability to navigate Linux via the command line
Familiarity with package management in common Linux distributions
Basic ability to build Linux servers to host Ruby application servers

### Learning Objectives

Students will understand:


### Learning Activities

Students will:

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* h

Students at an intermediate level will be able to:
* h

Students at the advanced level will be able to: (with some reference material):
* h

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=10
* Demonstrate the items from the basic section on a 20 minute exam

## EC2


### Target Competencies

Able to use Amazon’s EC2 to provision new servers and services
Able to log into an EC2 instance and complete installation of Ruby application servers

### Learning Objectives

Students will understand:


### Learning Activities

Students will:

### Performance Metrics

Students will be expected to perform at an intermediate level or above.

Students at a basic level will be able to:
* h

Students at an intermediate level will be able to:
* h

Students at the advanced level will be able to: (with some reference material):
* h

### Performance Standards

A passing student will be able to:
* Perform the general performance standards with n=10
* Demonstrate the items from the basic section on a 20 minute exam
