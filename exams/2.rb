require './scripts/examerizer'

exam2 = Exam.new("Exam 2")

# Sinatra
section = Section.new("Sinatra")
exam2.sections << section

# Create a new Sinatra project with a config.ru and a Gemfile
# section.questions << Question.new(%{In a well-formed Sinatra application, what files and directories do you need?}, %{app.rb, config.ru, Gemfile, /public, /views})
# section.questions << CodeQuestion.new(%{What should be in your config.ru?}, %{
# require './app'
# run Sinatra::Application})
# section.questions << CodeQuestion.new(%{What should be in your Gemfile?}, %{
# source 'https://rubygems.org'

# gem "sinatra"})
section.project_answers << ProjectAnswer.new(%{Create a new sinatra project with an main file, a file for rackup, a file for bundler, and a folder for static assets as well as a folder for templates.})
section.project_answers << ProjectAnswer.new(%{Create a route that responds to `/entries/:id` via GET and displays an index.erb from the templates directory.})
section.project_answers << ProjectAnswer.new(%{Create a route that responds to `/entries/:id` via PUT and redirects to `/entries/3`.})
section.project_answers << ProjectAnswer.new(%{Download jQuery and put it in your static assets directory. Link to this javascript file in your layout template.})

# Return static assets from a public folder
section.questions << Question.new(%{If you have a file called `index` in your public folder, can you override that file with `get "index" do; end`?}, %{No.})

# Use a reloader to make development faster
section.questions << Question.new(%{How do you enable reloading if you've already added sinatra-contrib to your Gemfile?}, %{require "sinatra/reloader" if development?})

# Use Basic authentication
section.questions << CodeQuestion.new(%{How do you put a Basic Auth dialog in front of your sinatra app?}, %{use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['admin', 'admin']
end})

# Short answers
section.short_answers << ShortAnswer.new(%{What projects lend themselves well to Sinatra and why?})

# Rails
section = Section.new("Rails")
exam2.sections << section

# Initialize a new project with Rails or rails-api
# section.questions << Question.new(%{How do you initialize a new Rails project?}, %{})
# section.questions << Question.new(%{How do you tell Rails to use Rspec as the default test framework?}, %{})
# section.questions << Question.new(%{How do you tell Rails to use Haml as the default template type?}, %{})
section.questions << Question.new(%{How do you see a list of all rake tasks}, %{rake -T})

section.project_answers << ProjectAnswer.new(%{Create a new Rails project.})
section.project_answers << ProjectAnswer.new(%{Install rspec and make it the default test framework})
section.project_answers << ProjectAnswer.new(%{Install haml and make it the default template language})
section.project_answers << ProjectAnswer.new(%{create a scaffold for a Card which has attributes: color (string), family (string), and number (integer)})
section.project_answers << ProjectAnswer.new(%{create a model User which has a username, has_many Votes, and belongs_to Profile?})
section.project_answers << ProjectAnswer.new(%{create a controller for User without using the scaffolder. Only implement show and index.})
section.project_answers << ProjectAnswer.new(%{create a static controller which has the actions about and contact. Have these render an erb file at "app/views/shared/steve.erb"})

# Use scaffolds to create new resources and models outside of the scaffolds
# section.questions << Question.new(%{How do you create a scaffold for a model Card which has attributes: color (string), family (string), and number (integer)?}, %{})
# section.questions << Question.new(%{How do you create a scaffold for a model User which has a username, has_many Votes, and belongs_to Profile?}, %{})
section.questions << Question.new(%{How do you see a list of generators that are available to you?}, %{rails generate -h})
section.questions << Question.new(%{What is a scaffold?}, %{A scaffold is a generator that creates a model, migration, and controller sufficient for use as a RESTful API})

# Use generic non-scaffold generators to create new resources
# section.questions << Question.new(%{How do you create a model Card which has attributes: color (string), family (string), and number (integer)?}, %{})
# section.questions << Question.new(%{How do you create a controller called CardsController with the actions: win, lose, and draw?}, %{})

# Create a static_controller or a pages_controller for non-dynamic content
# section.questions << Question.new(%{How do you create a controller which just serves up the pages '/about' and '/winners'?}, %{})
# section.questions << CodeQuestion.new(%{In a controller, how do you render an erb file?}, %{})
# section.questions << CodeQuestion.new(%{In a controller, how do you render either html or json?}, %{})
section.questions << Question.new(%{In the controller, how do you redirect to the winningest entries path?}, %{redirect_to winning_entries_path})

# Add routes to the Router
section.questions << Question.new(%{How do you create a route that allows the 7 standard controller actions for an object?}, %{resources 'entries'})
section.questions << Question.new(%{How do you create a route that matches '/submit' with the method "POST"}, %{post "submit", :to => 'entries#submit'})
section.questions << Question.new(%{How do you see a list of all the routes?}, %{rake routes})
section.questions << Question.new(%{How do you create a route that matches '/'}, %{root :to => 'entries#index'})

# Create SCSS and Coffeescript assets and include them in the layout
section.questions << Question.new(%{Where do coffeescript files live in the Rails folder structure?}, %{RAILS_ROOT/app/assets/javascripts})
section.questions << Question.new(%{Where do scss files live in the Rails folder structure?}, %{RAILS_ROOT/app/assets/stylesheets})
section.questions << Question.new(%{How do you include a javascript file before all the other javascript files}, %{Add that file to the manifest above 'require_tree .'})

# Use simple relationships to link models together
section.questions << Question.new(%{If model A has 'belongs_to :b' in the model file, which one has an extra _id column in the database table?}, %{Model A})
section.questions << Question.new(%{If model A has 'has_many :cs' in the model file, which one has an extra _id column in the database table?}, %{Model C})

# Deploy projects to Heroku
section.questions << Question.new(%{If you need to get data from your database to Heroku, how do you do it?}, %{heroku db:push})

# Short answers
section.short_answers << ShortAnswer.new(%{What types of projects lend themselves to Rails?})
section.short_answers << ShortAnswer.new(%{Assuming you've been developing with Postgres locally, what do you need to do to deploy to Heroku?})
section.short_answers << ShortAnswer.new(%{Draw a diagram and label the major parts of Rails.})


# Rails Gems
# Pagination, Simple Form, Active Admin, Paperclip
# Authentication, Access Control, Search, Caching

# SQL
section = Section.new("SQL")
exam2.sections << section

# Connect to mysql or sqlite3 via the command-line
section.questions << Question.new(%{How do you connect to MySQL via the network from the command line?}, %{mysql -u root -p -h localhost})
section.questions << Question.new(%{How do you connect to Sqlite3 via the command line?}, %{sqlite3 db/development.sqlite3})
section.questions << Question.new(%{What does it mean to connect via a socket?}, %{MySQL supports connecting via a Unix socket file instead of connecting over the network (great for conferences).})

# Execute SELECT, INSERT, UPDATE, and DELETE statements from the command-line
section.questions << Question.new(%{What command is used to find and return data?}, %{SELECT})
section.questions << Question.new(%{What sub-expression do you use to filter data?}, %{WHERE})

# Understand relationships and be able to discuss on a whiteboard or pseudo-code
section.questions << Question.new(%{When a model `has_many` other models, how does that affect the database?}, %{In some databases (InnoDB/Postgres) it'll add a foreign key, otherwise it doesn't affect it})
section.questions << Question.new(%{When a model Car `belongs_to` a Driver, how does that affect the database?}, %{The cars table must include a column driver_id})
section.questions << Question.new(%{What sub-expression do we use to add results from another table (not results from another query)}, %{LEFT JOIN or INNER JOIN})
section.questions << CodeQuestion.new(%{If you need to find all cars that belong to a driver (id: 3), how do you do that?}, %{SELECT *\nFROM cars\nWHERE driver_id = 3}, 'sql')
section.questions << CodeQuestion.new(%{If you need to find all cars that have a driver with hair_type = mullet, how do you do that?}, %{SELECT cars.*\nFROM cars\nLEFT JOIN drivers\n  ON drivers.id = cars.driver_id\nWHERE drivers.hair_type = 'mullet'}, 'sql')
section.questions << CodeQuestion.new(%{If you need to find all drivers that have a particular car (id: 42), how do you do that?}, %{SELECT cars.*\nFROM cars\nLEFT JOIN drivers\n  ON drivers.id = cars.driver_id\nWHERE cars.id = 42}, 'sql')

# Create migrations in Rails or Sinatra
section.questions << Question.new(%{How do you create a migration from the Rails command line?}, %{rails generate migration <name>})

# Understand ORDER and LIMIT
section.questions << Question.new(%{How do you restrict the number of results coming from the database?}, %{LIMIT n})
section.questions << Question.new(%{How do you order data?}, %{ORDER BY})

section.short_answers << ShortAnswer.new(%{What is a join and what is it useful for?})
section.short_answers << ShortAnswer.new(%{Write a query that finds all the rows in a table which have more than 1000 'wins', sorted by 'text', and restricted to only 25 rows })

# Backbone.js
section = Section.new("Backbone")
exam2.sections << section

# Create a backbone app from scratch with straight html and no Ruby framework
section.questions << Question.new(%{What files are required to be in your project to make a backbone.js website (use a CDN for vendored assets)?}, %{Only index.html and an app.js})
section.questions << Question.new(%{Do you need jQuery to use Backbone?}, %{For DOM manipulation it requires jQuery or Zepto and json2.js})
section.questions << Question.new(%{What order should you include your javascript files?}, %{jquery, jquery-migrate, underscore, backbone})
section.questions << Question.new(%{Should your backbone includes be in the head or the footer of the page?}, %{in the footer for performance reasons})

# Create a backbone app from scratch in multiple Ruby frameworks
section.questions << Question.new(%{How do you create a backbone app in Sinatra?}, %{put an index.erb in /views, render it from app.rb, and put the backbone includes in the layout})
section.questions << Question.new(%{How do you create a backbone app in Rails?}, %{create a static controller and put the backbone includes in the layout})
section.questions << Question.new(%{What does the rails-backbone gem give us?}, %{scaffolding support and files for the asset pipeline})

# Create models, views, and collections in one file
section.questions << Question.new(%{What is the main purpose of a model in Backbone?}, %{Persistence, validation, and data storage, triggering events on change})
# section.questions << CodeQuestion.new(%{How do you define a model?}, %{var Entry = Backbone.Model.extend({\n  urlRoot: '/entries'\n})}, 'javascript')
section.questions << Question.new(%{What is the main purpose of a collection?}, %{Fetching data and triggering events when something is added or removed})
# section.questions << CodeQuestion.new(%{How do you define a collection?}, %{var EntryList = Backbone.Collection.extend({\n  url: '/entries'\n})}, 'javascript')
section.questions << Question.new(%{What is the main purpose of a view in Backbone?}, %{To orchestrate between the DOM and any attached collections or models})
# section.questions << CodeQuestion.new(%{How do you define a view?}, %{var EntryListView = Backbone.View.extend({\n  el: "#entries",\n  initialize: function () {\n    _.bindAll(this, 'render')\n  }\n});}, 'javascript')

section.project_answers << ProjectAnswer.new(%{Create a new backbone project in middleman with an index.html and the javascript includes needed for Backbone.})
section.project_answers << ProjectAnswer.new(%{Create a Model and a Collection with a urlRoot or a url attribute.})
section.project_answers << ProjectAnswer.new(%{Create a ListView with an initialize function, el, an addOne and an addAll method.})
section.project_answers << ProjectAnswer.new(%{Bind the ListView to collection#reset and collection#add. Call collection#fetch from the initializer.})
section.project_answers << ProjectAnswer.new(%{Make the whole process to start by simply calling `new ListView()`.})
section.project_answers << ProjectAnswer.new(%{Make a button that calls collection#fetch. This should replace the already rendered content instead of adding to the bottom.})

# Create a model-view and a list-view composed of templates or other sub-views
# Bind to DOM events and respond to clicks and submissions
# Bind to model/collection events and respond to data changes



# section.questions << Question.new(%{}, %{})
# section.questions << CodeQuestion.new(%{}, %{})
# section.short_answers << ShortAnswer.new(%{})

# Employment
# Participate in several mock interviews / speed dating scenarios
# Recreate their resume
# Create a portfolio with their in-class projects
# Strengthen their digital presence on social networks and other visible websites
# Interact with open source communities and attempt to improve highly-public projects
# Give lightning talks each week
# White-board technical challenges in a low-stress environment


# section.questions << Question.new(%{}, %{})
# section.questions << CodeQuestion.new(%{}, %{})
# section.short_answers << ShortAnswer.new(%{})

puts exam2.to_s
