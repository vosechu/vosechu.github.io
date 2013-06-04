---
layout: page
body_classes: exercise
title: Week 10 &mdash; Overview
---

### Monday Stuff
* Warmup
* How was the weekend?
* How was host-a-hacker?
* Announcements
* Network points awards
* Networking events for the week
* Call for lightning talks
* Code review from host-a-hacker

### Weekly Topics
* Code review
* Retro / Review
* Practice

### Weekly Theme
* Refinement

### Weekly Home<del>work</del>**fun**
* Email me a link to your 10th Blog post. 1-2 pages (250-500 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* Prepare your lightning talk on your book.

## Monday &mdash; 3/4/2013
### Topics
* Code review from host-a-hacker
* Backbone.js TodoMVC
* Retro

### Goals
* Gain confidence with Backbone.js

### Reading to do before class
* [Backbone TodoMVC](https://github.com/addyosmani/todomvc/tree/gh-pages/architecture-examples/backbone/)

### Exercises

#### Stage 0 (Warmup)

* [#13 Wordy Calculator 2](https://github.com/JumpstartLab/warmup-exercises/tree/master/13-wordy-calculator-2)

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * Highlight sections of the TodoMVC code that you don't understand

#### Stage 2 (application/analyzing)
* Recreate TodoMVC without looking at the example code (it's okay to use the css/html)

#### Boss Fight (evaluation/creation)
* Have TodoMVC send data to a Rails api instead of to localStorage

## Tuesday &mdash; 3/5/2013
### Topics
* Rails practice
* Live coding

### Goals
* Gain confidence with Rails
* Layouts and rendering
* Flash, params, cookies/sessions

### Reading to do before class
* [Layouts and Rendering (Chapters 1-3)](http://guides.rubyonrails.org/layouts_and_rendering.html)
* [ActionController Overview (Chapters 1-6)](http://guides.rubyonrails.org/action_controller_overview.html)

### Code for the board
{% highlight ruby %}
# Minimum controller
class MinController < ApplicationController
  # use application.html.* for layout by default
  def index
    # render params[:action].html.* by default
    # in this case, index.html.erb
  end

  # Layouts
  layout :application
  def index
    render :index, :layout => 'bonk'
  end

  # Explicit render
  def index
    render :index
  end

  # Basic format support
  # This is error-prone
  def index
    if params[:format] == 'json'
      render json: { hello: 'mom' }.to_json
    else
      render :index
    end
  end

  # Better format support
  def index
    @entries = Entry.all

    respond_to do |format|
      format.html # default render (must go first though or ie7 will break)
      format.json { render :json => @entries }
    end
  end

  # Responds_with/to is an advanced syntax for the above
  respond_to :html, :json

  def index
    @entries = Entry.all
    respond_with @entries
  end

  # Create style
  # Create flow needs a 'new' page with just a form and a 'create' action which
  # can handle redirection or rendering 'new'
  def new
    @entry = Entry.new
  end

  def create
    @entry = Entry.new(params[:entry])

    if @entry.save
      redirect_to @entry
      # redirect_to entry_path(@entry)
      # redirect_to "entries/#{@entry.id}"
    else
      render :new
      # render :action => :new
    end
  end

  # Flashes
  # Flash is a one-time session variable that gets deleted on next page load
  # flash[] sends message on next page refresh
  # flash.now[] sends message on this page render
  # :notice and :error are common, but any are acceptable
  def create
    @entry = Entry.new(params[:entry])

    if @entry.save
      flash[:notice] = "Success!"
      redirect_to @entry
      # redirect_to @entry, :notice => "Success!"
    else
      flash.now[:erorr] = "Failure!"
      render :new
    end
  end

  # Message passing strategies
  def index
    # comes from POST'ed inputs or GET data like '?q=steve'
    params[:name] #=> 'steve'

    # long-term storage (not accepted by some browsers)
    cookies[:name] = 'steve'
    cookies[:name] #=> 'steve'

    # short-term storage (used to clear when browser closed, but now exists forever also)
    # preferred over cookies
    session[:name] = 'steve'
    session[:name] #=> 'steve'

    # extremely short-term storage (one page load)
    flash.now[:name] = 'steve'
    flash[:name] #=> 'steve'
  end
end
{% endhighlight %}

### Exercises

#### Stage 0 (Warmup)

* [#14 Wordy Calculator 3](https://github.com/JumpstartLab/warmup-exercises/tree/master/14-wordy-calculator-3)

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * What's the difference between flash and sessions?
  * What's the difference between flash and flash.now?
  * If a controller action doesn't render or redirect what happens?
  * When a 'create' action renders 'new', is it just using the template or calling `new()` as a method?

#### Stage 2 (application/analyzing)

* Sessions
  * Create a new rails app
  * Generate a new secret session token
  * Create a controller with actions `%w{alice bob chuck}`
  * In alice, based on a session cookie, either render bob or redirect to chuck
  * In bob and chuck, set a different session cookie
  * After redirection or rendering what is in the session cookie?
* Flash
  * Create two new actions `%w{david eugene}`
  * Set a `flash[:notice]` message and a different `flash.now[:notice]` message
  * Based on a param value, either render david or eugene
  * In the david and eugene views output the contents of `flash[:notice]`
  * Which flash message shows up after rendering and after redirecting?
* Layouts
  * Create a second layout file
  * Use the `layout` class method to make that second file the default
  * Use the `:layout` option on `render` to make that second file the layout for some individual action

## Wednesday &mdash; 3/6/2013
### Topics
* Testing (routes and units)

### Goals
* Gain an understanding of testing in Rails

### Reading to do before class
* [A Guide to testing in Rails (Chapters 9,1,3)](http://guides.rubyonrails.org/testing.html)

### Code for the board
{% highlight ruby %}
require 'spec_helper'

describe EntriesController do
  describe "routing" do
    it "routes #root to #index" do
      get("/").should route_to("entries#index")
    end

    # get("/entries").should route_to("entries#index")
    # get("/entries/new").should route_to("entries#new")
    # get("/entries/1").should route_to("entries#show", :id => "1")
    # get("/entries/1/edit").should route_to("entries#edit", :id => "1")
    # post("/entries").should route_to("entries#create")
    # put("/entries/1").should route_to("entries#update", :id => "1")
    # delete("/entries/1").should route_to("entries#destroy", :id => "1")
  end
end
{% endhighlight %}

### Exercises

#### Stage 0 (Warmup)

* [#15 Say](https://github.com/JumpstartLab/warmup-exercises/tree/master/15-say-1)
* [Tests](https://github.com/JumpstartLab/warmup-exercises/blob/master/17-say-3/say_test.rb)

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * Reiterate the main purpose of testing (1-3 words)?
  * What is a routing test and how does it compare to a controller test?
  * What things do we test about models in Rails?
  * How many assertions are allowed per test and why?
  * If we have more than 5 lines in our before block, what should we do?

#### Stage 2 (application/analyzing)

* Add route specs to Humanitywar
* Refactor unit tests in Humanitywar
  * Pull entry creation out into a private method or a factory
  * Add tests for scopes
  * Add test for order_white_cards
  * Add test for white_cards_correct_length
  * Test validations

#### Boss Fight (evaluation/creation)
* Install factory_girl and use it to create models instead of a private method
* Add controller tests
* Check coverage using rcov
* Check complexity using metric_fu, reek or Saikuro
