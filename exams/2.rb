require './scripts/examerizer'

exam2 = Exam.new("Exam 2")

# Sinatra
section = Section.new("Sinatra")
exam2.sections << section

# Create a new Sinatra project with a config.ru and a Gemfile
section.project_answers << ProjectAnswer.new(%{Create a new sinatra project with a main file, a file for rackup, a file for bundler, and a folder for static assets as well as a folder for templates.})
section.project_answers << ProjectAnswer.new(%{Create a route that responds to `/entries/:id` via GET and displays an index.erb from the templates directory.})
section.project_answers << ProjectAnswer.new(%{Create a route that responds to `/entries/:id` via PUT and redirects to `/entries/3`.})
section.project_answers << ProjectAnswer.new(%{Download jQuery and put it in your static assets directory. Link to this javascript file in your layout template.})

# Return static assets from a public folder
section.questions << Question.new(
  %{If you have a file called `index` in your public folder, can you override that file with `get "index" do; end`?},
  %{No. The static asset will always override the dynamic route}, [
    %{Yes, but only if you're not running apache/nginx.},
    %{Yes, but only if you've done `set :serve_assets_first, true`.},
    %{No, it will throw an error.}])

# Use a reloader to make development faster
section.questions << CodeQuestion.new(
  %{How do you enable reloading if you've already added sinatra-contrib to your Gemfile?},
    %{require "sinatra/reloader" if development?}, [
      %{set :reloading, true},
      %{def reloader\n  true\n end},
      %{include RackReloader}])

# Use Basic authentication
section.questions << CodeQuestion.new(
  %{
How do you put a Basic Auth dialog in front of your sinatra app?},
  %{
use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['admin', 'admin']
end}, [
  %{
use Sinatra::Auth do |env|
  env.basic == ['admin', 'admin']
end},
  %{
before do
  Sinatra::Application.authenticate_basic(basic[:user], basic[:password])
end
},
  %{
set :basic_auth, ['admin', 'admin']
}])

# Short answers
section.short_answers << ShortAnswer.new(%{What projects lend themselves well to Sinatra and why?})

# Rails
section = Section.new("Rails")
exam2.sections << section

# Initialize a new project with Rails or rails-api
section.questions << Question.new(
  %{How do you see a list of all rake tasks},
  %{rake -T}, [
    %{rake -h},
    %{rake help commands},
    %{rake tasks:list}])

section.project_answers << ProjectAnswer.new(%{Create a new Rails project.})
section.project_answers << ProjectAnswer.new(%{Install rspec and make it the default test framework})
section.project_answers << ProjectAnswer.new(%{Install haml and make it the default template language})
section.project_answers << ProjectAnswer.new(%{create a scaffold for a Card which has attributes: color (string), family (string), and number (integer)})
section.project_answers << ProjectAnswer.new(%{create a model User which has a username, has_many Votes, and belongs_to Profile})
section.project_answers << ProjectAnswer.new(%{create a controller for User without using the scaffolder. Only implement show and index.})
section.project_answers << ProjectAnswer.new(%{create a static controller which has the actions about and contact. Have these render an erb file at "app/views/shared/steve.erb"})

# Use scaffolds to create new resources and models outside of the scaffolds
section.questions << Question.new(
  %{How do you see a list of generators that are available to you?},
  %{rails generate -h}, [
    %{rails generate list},
    %{rails help generate},
    %{rails list generators}])
section.questions << Question.new(
  %{What is a scaffold?},
  %{A scaffold is a generator that creates a model, migration, and controller sufficient for use as a RESTful API}, [
    %{A scaffold is the javascript file that combines multiple other javascript files},
    %{A scaffold is a generator that creates views for a controller},
    %{A scaffold provides an admin interface complete with user login}])

# Use generic non-scaffold generators to create new resources

# Create a static_controller or a pages_controller for non-dynamic content
section.questions << Question.new(
  %{In the controller, how do you redirect to the winning entries path?},
  %{redirect_to winning_entries_path}, [
    %{redirect winningest_path},
    %{redirect :to => winning_entries_path},
    %{render :wining_entries}])

# Add routes to the Router
section.questions << Question.new(
  %{How do you create a route that allows the 7 standard RESTful controller actions for an object?},
  %{resources 'entries'}, [
    %{resource entries_route},
    %{resources Entry},
    %{resources :entries, :rest => true}])
section.questions << Question.new(
  %{How do you create a route that matches '/submit' with the method "POST" and directs to the entries controller},
  %{post "submit", :to => 'entries#submit'}, [
    %{post "submit"},
    %{controller: entries, action: submit},
    %{match 'submit#entries'}])
section.questions << Question.new(
  %{How do you see a list of all the routes?},
  %{rake routes}, [
    %{rails routes},
    %{rake -T},
    %{rake routes:draw}])
section.questions << Question.new(
  %{How do you create a route that matches '/'},
  %{root :to => 'entries#index'}, [
    %{match ""},
    %{get ""},
    %{match /\/+/}])

# Create SCSS and Coffeescript assets and include them in the layout
section.questions << Question.new(
  %{Where do coffeescript files live in the Rails folder structure?},
  %{RAILS_ROOT/app/assets/javascripts}, [
    %{RAILS_ROOT/vendor/coffeescript},
    %{RAILS_ROOT/app/assets/coffeescripts},
    %{RAILS_ROOT/public/}])
section.questions << Question.new(
  %{Where do scss files live in the Rails folder structure?},
  %{RAILS_ROOT/app/assets/stylesheets}, [
    %{RAILS_ROOT/vendor/scss},
    %{RAILS_ROOT/app/assets/scss},
    %{RAILS_ROOT/public/}])
section.questions << Question.new(
  %{How do you include a javascript file before all the other javascript files},
  %{Add that file to the manifest above `require_tree .`}, [
    %{Add it to the layout before `javascript_include_tag :all`},
    %{Use RequireJS to ensure ordering},
    %{Set it in `config/assets/pipeline.rb`}])

# Use simple relationships to link models together
section.questions << Question.new(
  %{If model A has 'belongs_to :b' in the model file, which one has an extra `_id` column in the database table?},
  %{Model A}, [
    %{Model B},
    %{Neither, it's handled by the database},
    %{Both, we have to be able to traverse both ways}])
section.questions << Question.new(
  %{If model A has 'has_many :cs' in the model file, which one has an extra `_id` column in the database table?},
  %{Model C}, [
    %{Model A},
    %{Neither, it's handled by the database},
    %{Both, we have to be able to traverse both ways}])

# Deploy projects to Heroku
section.questions << Question.new(
  %{If you need to get data from your database to Heroku, how do you do it?},
  %{heroku db:push}, [
    %{heroku pgdata:backup},
    %{heroku pg:download},
    %{mysql -u postgres -p -h `<myname>`.herokuapp.com}])

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
section.questions << Question.new(
  %{How do you connect to MySQL via the network from the command line?},
  %{mysql -u root -p -h localhost}, [
    %{mysql -u root -p -t network},
    %{mysql -n en0},
    %{mysql -u root -p -s /var/spool/mysql.sock}])
section.questions << Question.new(
  %{How do you connect to Sqlite3 via the command line?},
  %{sqlite3 db/development.sqlite3}, [
    %{sqlite db/development.sqlite},
    %{sqlite3 .},
    %{cd db && sqlite "." -d humanitywar-rails}])

# Execute SELECT, INSERT, UPDATE, and DELETE statements from the command-line
section.questions << Question.new(
  %{What command is used to find and return data?},
  %{SELECT}, [
    %{FIND},
    %{RETURN},
    %{SELECT_IN}])
section.questions << Question.new(
  %{What sub-expression do you use to filter data?},
  %{WHERE}, [
    %{FILTER},
    %{REDUCE},
    %{MAP}])

# Understand relationships and be able to discuss on a whiteboard or pseudo-code
section.questions << Question.new(
  %{When a model declares in Rails that it `has_many` other models, how does that affect the database?},
  %{Nothing special happens on any database, it's a Rails only method.}, [
    %{It adds an index to the model that has_many so that lookups are fast.},
    %{In some databases (InnoDB/Postgres) it'll add a foreign key, otherwise it doesn't affect it.},
    %{It adds an id column and a primary key index to the parent table.}])
section.questions << Question.new(
  %{When a model Car declares in Rails that it `belongs_to` a Driver, how does that affect the database?},
  %{The cars table must include a column driver_id}, [
    %{The drivers table must include a column car_id},
    %{The cars table gets a new column called driver_ids which lists all driver ids.},
    %{Nothing happens in either table, belongs_to is a Rails only method.}])
section.questions << Question.new(
  %{What sub-expression do we use to add results from another table (not results from another query)},
  %{LEFT JOIN or INNER JOIN}, [
    %{UNION},
    %{OUTER JOIN},
    %{SPLICE}])
section.questions << CodeQuestion.new(
  %{If you need to find all cars that belong to a driver (id: 3), how do you do that without using a join?},
  %{
SELECT *
FROM cars
WHERE driver_id = 3
}, [
    %{
SELECT cars
FROM drivers
WHERE drivers.car = 3
      },
    %{
SELECT *
FROM *
WHERE driver.id = 3
      },
    %{
SELECT *
FROM cars
LEFT JOIN drivers
  ON cars.driver_id = drivers.id
WHERE drivers.id = 3
      }], 'sql')
section.questions << CodeQuestion.new(
  %{If you need to find all cars that have a driver with hair_type = mullet, how do you do that?},
  %{
SELECT cars.*
FROM cars
LEFT JOIN drivers
  ON drivers.id = cars.driver_id
WHERE drivers.hair_type = 'mullet'
}, [
    %{
SELECT drivers.cars
FROM drivers
WHERE drivers.hair_type = 'mullet'
      },
    %{
SELECT *
FROM cars, drivers
WHERE cars = drivers
AND drivers.hair_type = 'mullet'
      },
    %{
SELECT *
FROM drivers
WHERE hair_type = 'mullet'
      }], 'sql')
section.questions << CodeQuestion.new(
  %{If you need to find all drivers that have a particular car (id: 42), how do you do that?},
  %{
SELECT cars.*
FROM cars
INNER JOIN drivers
  ON drivers.id = cars.driver_id
WHERE cars.id = 42
}, [
    %{
SELECT cars.*
FROM cars
UNION drivers
WHERE cars.id IN drivers.car_ids
AND car.id = 42
      },
    %{
SELECT drivers.*
FROM drivers, cars
WHERE drivers IN cars
AND car.id = 42
      },
    %{
SELECT *
FROM drivers
LEFT JOIN cars
  ON cars.driver_id EXISTS
WHERE car.id = 42
      }], 'sql')

# Create migrations in Rails or Sinatra
section.questions << Question.new(
  %{How do you create a migration from the Rails command line?},
  %{rails generate migration `<name>`}, [
    %{rake db:migrate:new `<name>`},
    %{rake db:migration:create `<name>`},
    %{rails migrate new `<name>`}])

# Understand ORDER and LIMIT
section.questions << Question.new(
  %{How do you restrict the number of results coming from the database?},
  %{LIMIT n}, [
    %{RESTRICT n},
    %{FOLD n},
    %{REJECT n}])
section.questions << Question.new(
  %{How do you order data?},
  %{ORDER BY}, [
    %{ORDER_WHERE},
    %{SORT},
    %{GROUP BY}])

section.short_answers << ShortAnswer.new(%{What is a join and what is it useful for?})
section.short_answers << ShortAnswer.new(%{Write a query that finds all the rows in a table which have more than 1000 'wins', sorted by 'text', and restricted to only 25 rows })

# Backbone.js
section = Section.new("Backbone")
exam2.sections << section

# Create a backbone app from scratch with straight html and no Ruby framework
section.questions << Question.new(
  %{What files are required to be in your project to make a backbone.js website (use a CDN for vendored assets)?},
  %{Only index.html and an app.js.}, [
    %{index.html, layout.erb, app.js, jquery.js, backbone.js, underscore.js.},
    %{Only an app.js.},
    %{config.ru, Gemfile, package.json and app.js}])
section.questions << Question.new(
  %{Do you need jQuery to use Backbone?},
  %{Yes, For DOM manipulation it requires jQuery or Zepto and json2.js.}, [
    %{No, underscore is perfectly capable of doing everything jQuery does.},
    %{Yes, but only if you use the extend syntax},
    %{No, jQuery is only needed for IE6 compatibility}])
section.questions << Question.new(
  %{In what order should you include your javascript files?},
  %{jquery, underscore, backbone}, [
    %{backbone, underscore, jquery},
    %{backbone, underscore, jquery, jquery-min, backbone-min},
    %{backbone, jquery}])
section.questions << Question.new(
  %{Should your backbone includes be in the head or the end of the body?},
  %{In the end of the body for performance reasons}, [
    %{In the header for compatibility reasons},
    %{After the body to make sure it's been loaded},
    %{Before all other content to ensure that the DOM is loaded}])

# Create a backbone app from scratch in multiple Ruby frameworks
section.short_answers << ShortAnswer.new(%{How do you create a backbone app in Sinatra?})
section.short_answers << ShortAnswer.new(%{How do you create a backbone app in Rails?})

section.questions << Question.new(
  %{What does the rails-backbone gem give us?},
  %{Scaffolding support and files for the asset pipeline.}, [
    %{It installs backbone from a CDN.},
    %{It turns scaffolds into backbone compatible views},
    %{It removes controllers and turns them into backbone routers}])

# Create models, views, and collections in one file
section.questions << Question.new(
  %{What is the main purpose of a model in Backbone?},
  %{Persistence, validation, and data storage, triggering events on change.}, [
    %{Triggering events when the DOM changes.},
    %{Connecting to an API and fetching lists of data.},
    %{Nothing anymore, they've been superseded by collections.}])
section.questions << Question.new(
  %{What is the main purpose of a collection?},
  %{Fetching data and triggering events when something is added or removed.}, [
    %{Handling memory management of models so they don't leak memory.},
    %{Changing the DOM when a model changes.},
    %{Fetching single objects from a database.}])
section.questions << Question.new(
  %{What is the main purpose of a view in Backbone?},
  %{To orchestrate between the DOM and any attached collections or models}, [
    %{To append templates to the DOM},
    %{To start collection fetches and model fetches},
    %{All of these}])

section.project_answers << ProjectAnswer.new(%{Create a new backbone project in middleman with an index.html and the javascript includes needed for Backbone.})
section.project_answers << ProjectAnswer.new(%{Create a Model and a Collection with a urlRoot or a url attribute.})
section.project_answers << ProjectAnswer.new(%{Create a ListView with an initialize function, el, an addOne and an addAll method.})
section.project_answers << ProjectAnswer.new(%{Bind the ListView to collection#reset and collection#add. Call collection#fetch from the initializer.})
section.project_answers << ProjectAnswer.new(%{Make the whole process start by simply calling `new ListView()`.})
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
