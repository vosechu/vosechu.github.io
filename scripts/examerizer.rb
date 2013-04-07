# ruby scripts/examerizer.rb > exams/2.md

class Exam
  attr_reader :title
  attr_accessor :sections

  def initialize(title)
    @title = title
    @sections = []
  end

  def to_s
    msg = "# #{@title}\n\n"
    msg += @sections.map(&:to_s).join("\n")
  end
end

class Section
  attr_reader :title
  attr_accessor :questions
  attr_accessor :short_answers

  def initialize(title)
    @title = title
    @questions = []
    @short_answers = []
  end

  def to_s
    msg = "## #{@title}\n"
    msg += "### Multiple-choice Answer\n\n"
    @questions.each do |question|
      msg += "#{question.to_s}\n"
      msg += "***\n\n"
    end
    msg += "### Short Answer\n\n"
    @short_answers.each do |question|
      msg += "#{question.to_s}\n"
      msg += "***\n\n"
    end
    return msg
  end
end

class Question
  attr_reader :question
  attr_accessor :answer

  def initialize(question, answer)
    @question = question
    @answer = answer
  end

  def to_s
    msg = "Q: #{@question}\n\n"
    choices = ["A: ", "B: ", "C: ", "D: "]
    r = Random.rand(0..3)
    choices.each_with_index do |choice, index|
      if r == index
        msg += "* #{choice}#{answer}\n"
      else
        msg += "* #{choice}\n"
      end
    end
    return msg
  end
end

class RubyQuestion < Question
  def to_s
    msg = "Q: #{@question}\n\n"
    choices = ["A: ", "B: ", "C: ", "D: "]
    r = Random.rand(0..3)
    choices.each_with_index do |choice, index|
      if r == index
        msg += "* #{choice}\n{% highlight ruby %}\n#{answer}\n{% endhighlight %}\n"
      else
        msg += "* #{choice}\n{% highlight ruby %}\n{% endhighlight %}\n"
      end
    end
    return msg
  end
end

class ShortAnswer
  attr_reader :question

  def initialize(question)
    @question = question
  end

  def to_s
    msg = "Q: #{@question}\n\n"
    msg += "A: \n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n"

    return msg
  end
end

e = Exam.new("Exam 2")

# Sinatra
section = Section.new("Sinatra")
e.sections << section

# Create a new Sinatra project with a config.ru and a Gemfile
section.questions << Question.new(%{In a well-formed Sinatra application, what files and directories do you need?}, %{app.rb, config.ru, Gemfile, /public, /views})
section.questions << RubyQuestion.new(%{What should be in your config.ru?}, %{require './app'
run Sinatra::Application})
section.questions << RubyQuestion.new(%{What should be in your Gemfile?}, %{source 'https://rubygems.org'

gem "sinatra"})

# Create RESTful routes and respond with HTML
section.questions << Question.new(%{In what folder should you place views that you want to render?}, %{/views})
section.questions << RubyQuestion.new(%{How do you define a PUT route with the path "/entries"?}, %{put "/entries" do; end})
section.questions << RubyQuestion.new(%{How do you render an ERb file?}, %{get "/entries/:id" do
  render :index
end})

# Return static assets from a public folder
section.questions << Question.new(%{In what folder should you put assets that don't need any pre-processing?}, %{/public})
section.questions << Question.new(%{If you have a file called `index` in your public folder, can you override that file with `get "index" do; end`?}, %{No.})

# Use a reloader to make development faster
section.questions << Question.new(%{How do you enable reloading if you've already added sinatra-contrib to your Gemfile?}, %{require "sinatra/reloader" if development?})

# Use Basic authentication
section.questions << RubyQuestion.new(%{How do you put a Basic Auth dialog in front of your sinatra app?}, %{use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['admin', 'admin']
end})

# Short answers
section.short_answers << ShortAnswer.new(%{What projects lend themselves well to Sinatra and why?})
section.short_answers << ShortAnswer.new(%{})
section.short_answers << ShortAnswer.new(%{})

# Rails
section = Section.new("Rails")
e.sections << section

# Initialize a new project with Rails or rails-api
section.questions << Question.new(%{How do you initialize a new Rails project?}, %{})
section.questions << Question.new(%{How do you tell Rails to use Rspec as the default test framework?}, %{})
section.questions << Question.new(%{How do you tell Rails to use Haml as the default template type?}, %{})
section.questions << Question.new(%{How do you see a list of all rake tasks}, %{rake -T})

# Use scaffolds to create new resources and models outside of the scaffolds
section.questions << Question.new(%{How do you create a scaffold for a model Card which has attributes: color (string), family (string), and number (integer)?}, %{})
section.questions << Question.new(%{How do you create a scaffold for a model User which has a username, has_many Votes, and belongs_to Profile?}, %{})
section.questions << Question.new(%{How do you see a list of generators that are available to you?}, %{rails generate -h})

# Use generic non-scaffold generators to create new resources
section.questions << Question.new(%{How do you create a model Card which has attributes: color (string), family (string), and number (integer)?}, %{})
section.questions << Question.new(%{How do you create a controller called CardsController with the actions: win, lose, and draw?}, %{})

# Create a static_controller or a pages_controller for non-dynamic content
section.questions << Question.new(%{How do you create a controller which just serves up the pages '/about' and '/winners'?}, %{})
section.questions << RubyQuestion.new(%{In a controller, how do you render an erb file?}, %{})
section.questions << RubyQuestion.new(%{In a controller, how do you render either html or json?}, %{})
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
section.questions << RubyQuestion.new(%{If you need to get data from your database to Heroku, how do you do it?}, %{})

# Create migrations
section.questions << Question.new(%{How do you generate a new migration?}, %{})
section.questions << RubyQuestion.new(%{In a migration, how do you rename a column from 'loses' to 'losses'?}, %{})

# Short answers
section.short_answers << ShortAnswer.new(%{What types of projects lend themselves to Rails?})
section.short_answers << ShortAnswer.new(%{Assuming you've been developing with Postgres locally, what do you need to do to deploy to Heroku?})
section.short_answers << ShortAnswer.new(%{Draw a diagram and label the major parts of Rails.})
# section.short_answers << ShortAnswer.new(%{})

puts e.to_s
puts "Questions: " + e.sections.reduce(0) {|sum, s| sum += s.questions.count }.to_s
puts "Short Answers: " + e.sections.reduce(0) {|sum, s| sum += s.short_answers.count }.to_s




# Rails Gems
# Gem review (Pagination, Simple Form, Active Admin, Paperclip)

# SQL
# Connect to mysql or sqlite3 via the command-line
# Execute SELECT, INSERT, UPDATE, and DELETE statements from the command-line
# Understand relationships and be able to discuss on a whiteboard or pseudo-code
# Create migrations in Rails or Sinatra
# Understand ORDER and LIMIT

# Backbone.js
# Create a backbone app from scratch in multiple Ruby frameworks
# Create a backbone app from scratch with straight html and no Ruby framework
# Create models, views, and collections in one file
# Create a model-view and a list-view composed of templates or other sub-views
# Bind to DOM events and respond to clicks and submissions
# Bind to model/collection events and respond to data changes

# Employment
# Participate in several mock interviews / speed dating scenarios
# Recreate their resume
# Create a portfolio with their in-class projects
# Strengthen their digital presence on social networks and other visible websites
# Interact with open source communities and attempt to improve highly-public projects
# Give lightning talks each week
# White-board technical challenges in a low-stress environment








