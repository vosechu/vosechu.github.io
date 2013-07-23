---
layout: page
body_classes: exercise
title: Week 6 &mdash; Overview
---

### Monday Stuff
* How was the weekend?
* Announcements
* Network points awards
* Networking events for the week
* Call for lightning talks

### Monday comprehension questions
* In HTML, What is a microformat?
* In Git, how do we stage files for commit?
* Why does git have a staging step?
* In OOP, What is encapsulation?
* Why do we want inheritance?
* What is dynamic dispatch?
* In SQL, What is database normalization?
* What is a join?
* In Ruby, how is a module different from a class?
* In CSS, what is a clearfix?
* What is a reset or a normalize.css?

### Weekly Topics
* Introduction to Rails (MVC, Routing)
* Rails Active Query Interface / Relationships
* Rails Form Helpers
* Rails Asset Pipeline

### Weekly Theme
* Creating a Cards Against Humanity War website in Rails.

### Weekly Home<del>work</del>**fun**
* Email me a link to your 6th Blog post. 1-2 pages (250-500 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* Email me a link to where you feature your Rails site on your portfolio

## Monday &mdash; 3/11/2013
### Topics
* Introduction to Rails
* Installation / Generation of new projects
* General layout
* Scaffolds / JSON APIs
* What is MVC and what are the responsibilities of each (MR.T)
* Routing
* Views
* Models
* Controllers
* Migrations

### Goals
* Understand why we love Rails
* Be able to talk about what the MVC components are and their responsibilities
* Be able to generate a site with scaffolds
* Controllers are for delegation

### Reading to do before class
* [Getting started with Rails](http://guides.rubyonrails.org/getting_started.html)
* [Treehouse: Build a simple Rails app: Intro, Frontend](http://teamtreehouse.com/library/programming/build-a-simple-ruby-on-rails-application)

### Resources
* [Chuck's HumanityWar Rails project example](https://github.com/vosechu/humanitywar-rails)
* [Rails API Docs](http://apidock.com/rails)
* [Rails guides](http://guides.rubyonrails.org)

### Helpful Commands
{% highlight bash %}
# Stock new project generator (test/unit, sqlite3)
rails new humanitywar-rails

# My project generator (rspec, haml, postgres)
rails new humanitywar-rails --skip-test-unit --skip-bundle --database=postgres
# Add gems 'haml-rails' and 'rspec-rails' to the Gemfile and bundle
rails generate rspec:install

# Generate a JSON API and HTML Scaffold for a model
rails generate scaffold Animal country:references legs:integer noise # could also be noise:string but it's assumed it's a string unless specified

# Database commands
rake db:create:all  # Create the databases in Postgres (incl. test and production databases)
rake db:migrate     # Create the tables in the database
rake db:seed        # Create the data in the tables
{% endhighlight %}

### Demonstration notes
* Create new rails app
* Show general structure of a new rails app
* Generate an animal scaffold
* Destroy animal scaffold
* Add in haml/rspec
* Generate an animal scaffold, note the differences
* Create and migrate the database
* Run the test suite
* Start the server

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your group
  * What is the model's _main_, single responsibility?
  * What is the controller's main responsibility?
  * What is a scaffold and how do we generate one?
  * What are some of the model's additional responsibilities?

#### Stage 2 (application/analyzing)

* (Overall theme: do the same thing as the demonstration except for CAH)
* One member of the group should
  * Generate a new rails project
  * Push the 'initial commit' to github and add the others as contributors
  * Generate scaffolds for a WhiteCard, BlackCard, Entry, and Playa resource (don't worry about relationships yet, that's tomorrow)
  * Delete the views, controllers, and tests that we aren't using (don't you already regret using the scaffold?)
  * Run the test suite and make sure you didn't break anything

#### Boss Fight (evaluation/creation)

* Go to Chuck's example and rip off the css/html and start integrating it
* also rip off the db/seeds.rb file so you can `rake db:seed` when you get everything working
* Add click handlers to the `entries#index` view which allow us to vote on a card (even if the route they post/put to doesn't exist)

## Tuesday &mdash; 3/12/2013
### Topics
* Rails Active Query Interface / Relationships

### Goals
* Understand and be able to find models
* Understand relationships and how to create/find within a relationship
* Understand scopes

### Important Threshold Concepts
* has_one, has_many, belongs_to

### Reading to do before class
* [Associations (Chapter 1,2)](http://guides.rubyonrails.org/association_basics.html)
* [Active Record Query Interface (Chapter 1,2,3,12,13,15)](http://guides.rubyonrails.org/active_record_querying.html)
* [Rails for Zombies](http://railsforzombies.org/)

### Resources

### Helpful Commands
{% highlight bash %}
# IRB but with access to the models, relationships, etc.
rails console
{% endhighlight %}

### Code for the board
{% highlight ruby %}
# Scopes
class Entry < ActiveRecord::Base
  default_scope order('wins ASC')
  scope :game, order('random()').limit(2)
end
Entry.all # ordered by wins
Entry.game # random order, limit 2
Entry.find(42)
Entry.find_by_black_card_id(42) # dynamic finder
Entry.where("wins > 42")

# Example relationships
class Entry < ActiveRecord::Base
  has_one :vote
  belongs_to :white_card
end
class WhiteCard < ActiveRecord::Base
  has_many :entries
end

# Finding relationships
Entry.joins(:white_card).where("white_cards.text LIKE '%sorcerer%'")
Entry.white_cards.where("text LIKE '%sorcerer%'")

# Creating via relationship
Playa.entries.create({:black_card_id => 42, ...}) # This will set playa_id automatically
Entry.create_vote()
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your group
  * How do you find models?
  * How do you use a where?
  * How do you use a scope?
  * What is a relationship?
  * What's the difference between `belongs_to` and `has_one`?
  * Why would we use `entries.create` instead of just `Entry.create`?

#### Stage 2 (application/analyzing)

* One new member of the group should
  * Fork the group repo and get the code on their machine
  * Start adding the relationships to the models
  * Create a new migration which adds the belongs_to ids to each table that needs it
  * From the rails console, ensure that you can find models and find across relationships

#### Boss Fight (evaluation/creation)

* Display two cards on `entries#index` with an `<a>` around each pair of cards
* Add a click handler to the anchors which submits the vote over ajax to `entries#vote`

## Wednesday &mdash; 3/13/2013
### Topics
* Rails Form Helpers

### Goals
* To understand and be able to use forms to submit changes to models
* To understand and be able to use forms to submit arbitrary data to a route
* To understand and be able to use backend validations

### Important Threshold Concepts
* jQuery validate is not enough

### Reading to do before class
* [Treehouse: Build a simple Rails app: Forms](http://teamtreehouse.com/library/programming/build-a-simple-ruby-on-rails-application/customizing-forms)
* [Rails validations (Chapters 1,2,3,8)](http://guides.rubyonrails.org/active_record_validations_callbacks.html)

### Resources
* [Simpleform docs](https://github.com/plataformatec/simple_form)

### Helpful Commands
{% highlight bash %}
# Needs bootstrap gem https://github.com/seyhunak/twitter-bootstrap-rails
rails generate simple_form:install --bootstrap

# Add simpleform and twitter bootstrap to the Gemfile
echo 'gem "therubyracer"
gem "less-rails" #Sprockets (what Rails 3.1 uses for its asset pipeline) supports LESS
gem "twitter-bootstrap-rails"' >> Gemfile
bundle
rails generate bootstrap:install less
rails generate simple_form:install --bootstrap
{% endhighlight %}

### Code for the board
{% highlight erb %}
<%= simple_form_for @playa do |f| %>
  <%= f.input :username %>
  <%= f.input :password %>
  <%= f.button :submit %>
<% end %>
<%= simple_form_for @entry do |f| %>
  <%= f.association :white_card # renders select box %>
  <%= f.association :black_card, :as => :check_boxes %>
  <%= f.button :submit %>
<% end %>
{% endhighlight %}

{% highlight ruby %}
class Playa < ActiveRecord::Base
  validates_presence_of :username
  validates_format_of :email, :with => /.*@gmail\.com/
end
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your group
  * How are `name` attributes generated and used in Rails?
  * Why isn't jQuery Validate sufficient?
  * How do I display validation errors using SimpleForm?
  * How do I generate form elements that work with bootstrap's styles using SimpleForm?
  * How do I make a dropdown to chose which Playa is associated with an Entry?

#### Stage 2 (application/analyzing)

* One new member of the group should
  * Fork the group repo and get the code on their machine.
  * Create a form for `entries#new` using SimpleForm.
  * This form should have two dropdowns for selection of WhiteCard and BlackCard.
  * This form should have a text field for Playa email.
  * Upon submission, the `entries#create` should create an Entry, associate the cards, and find or create a new Playa.
  * If it saves, redirect to `entries#show`. Display a flash message of success.
  * If it fails validation, render `entries#edit` again. Display a flash message of failure.

#### Boss Fight (evaluation/creation)

* Start styling `entries#show` so this page isn't so ugly.
* Use Bootstrap on the submission form.
* Start creating `entries#winningest` and `entries#losingest`.

## Thursday &mdash; 3/14/2013
### Topics
* Rails Asset Pipeline

### Goals
* Understand and be able to use the asset pipeline to use SCSS, Haml, and Coffescript files.
* Understand and be able to use Coffeescript to add functionality to the site
* Understand minification/compression
* Understand what a manifest is

### Reading to do before class
* [Asset Pipeline (Chapters 1,2,3,4)](http://guides.rubyonrails.org/asset_pipeline.html)

### Resources
* [RailsCast #279: Understanding the Asset Pipeline](http://railscasts.com/episodes/279-understanding-the-asset-pipeline)
* [HTML to Haml converter](http://html2haml.heroku.com/)

### Helpful Commands
{% highlight bash %}
rake assets:precompile  # Generate the static versions of the SCSS and Coffee files. This prevents compilation in development mode.
rake assets:clean       # Un-generate static files.
{% endhighlight %}

### Code for the board
{% highlight coffeescript %}
// Domready
$ ->
  // Add click handler
  $('.entries a').on 'click', (e) ->
    // Prevent navigation
    e.preventDefault()
    $target = $(e.currentTarget)
    $.ajax
      url: '/entries/win'
      method: 'PUT'
      data:
        // Use data attributes on the link
        win_id: $target.data('win_id')
        lose_id: $target.data('lose_id')
      success: (data) ->
        // Page should reload if all went well
        location.reload()
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your group
  * How do we get SCSS and Coffeescript to work in Rails?
  * How do we get Haml to work in Rails?
  * Why are the scss and coffee files created per controller?
  * What is an asset manifest and how do I add to it?
  * How do I require jquery before any other javascript in my manifest?
  * How do I turn on minification and compression?

#### Stage 2 (application/analyzing)

* One new member of the group should
  * Fork the group repo and get the code on their machine
  * Convert your HTML/ERB files to Haml
  * Using the entries.js.coffee, create a click handler that `PUT`s information to `entries#vote` (regardless of whether you have that route or not yet)
    * In the index.html.haml, ensure that the anchor around the entry contains two data attributes, `data-win_id` and `data-lose_id` which hold the ids of the cards
    * Using `jQuery.data()`, grab the data attribute from `$(e.currentTarget)` and use that in your `$.ajax` call as a data attribute.
    * When you click on an entry, ensure that the data is going into the Rails console.
  * Once you have data coming into the application, use `Entry#increment!` to increase the number of wins and losses that the two entries have.
  * Ensure that this data is displaying on `Entries#show`

#### Boss Fight (evaluation/creation)

* Like KittenWar, display a small version of the cards you selected with their stats below each small entry.
* Polish up submission, `entries#show`, and `entries#index`

## Friday &mdash; 3/15/2013
* Wrapping it all up
* Quiz
* Retrospective
* Code review
* 1-on-1’s / Catchup time
* Networking points report
* Go
* Teambuilding