---
layout: page
body_classes: exercise
title: Week 9 &mdash; Overview
---

### Monday Stuff
* How was the weekend?
* Announcements
* Student announcements
* Stars for reading assignments
* Networking events for the week
* Call for lightning talks
* Warmup exercise

### Monday comprehension questions
* What did you learn from the job fair?
* Why would we bother doing backbone in rails?
* What is the purpose of the backbone-rails gem?
* How does a backbone view relate to a rails controller?
* In rails, what do we need to do to implement will_paginate?
* What is the difference between app/assets and vendor/assets?
* What are the philosophical differences between ActiveAdmin and RailsAdmin?
* Why do we recommend simple_form over formtastic?

### Weekly Topics
* Open source
* Gem review (Authentication, Access Control, Search, Caching)
*   http//www.intridea.com/blog/2011/5/13/rails3-gems
*   https//github.com/languages/Ruby/most_watched
* Deployment
* Host-a-hacker

### Weekly Theme
* Shipping open source
* Practice

### Weekly Home<del>work</del>**fun**
* Email me a link to your 9th Blog post. 1-2 pages (250-500 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* Ship one documentation fix to a major open source project

## Monday &mdash; 3/4/2013
### Topics
* Open source
* Breaking into communities
* Documentation fixes

### Goals
* Understand the importance of open source
* Build rails and run tests
* Get our first documentation fix on our portfolio

### Reading to do before class
* [Intro to open source (skim)](http://producingoss.com/en/introduction.html)
* [Contributing to Rails](http://guides.rubyonrails.org/contributing_to_ruby_on_rails.html)

### Additional reading resources
* [The Cathedral and the Bazaar](http://www.catb.org/~esr/writings/cathedral-bazaar/cathedral-bazaar/)

### Resources
* [The book on making open source projects work](http://producingoss.com/)
* [Installing rails from Git source](https://gist.github.com/sowawa/2515536)

### Helpful Commands
{% highlight bash %}
# Building and running tests
git clone git://github.com/rails/rails.git
cd rails
gem install bundler
bundle --without db
bundle exec rake test

# Installing built version of rails (inside rails checkout)
ruby install.rb 4.0.0.beta1

# Installing from source (one directory up from rails checkout)
gem install thor
ruby ./rails/railties/bin/rails new <project name> --dev
cd <project name>
bundle exec rails s
{% endhighlight %}

### Code for the board

* Verifying bug reports
* Testing patches
* Documentation patches

### Exercises

#### Warmup

* [#11 Scrabble](https://github.com/JumpstartLab/warmup-exercises/tree/master/11-scrabble-score)

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * Roughly how many open source projects fail?
  * Does an open source license guarantee hordes of volunteers?
  * Summarize the three paragraphs under the Jeremy Zawinski quote
  * In Rails, which coding conventions seem the oddest?
  * In exactly 12 words, summarize the Changelog conventions
  * How do you contribute to Docrails?

#### Stage 2 (application/analyzing)

* Clone and run the Rails test suite (activerecord should fail)
* Testing failing bugs
  * Find a recently accepted issue
  * Checkout the commit before that issue's sha
  * Add the tests from that issue and ensure that they're failing
  * Add in the patch from that issue and ensure the tests pass
  * Do a convention review and see if there are any issues
  * Check the documentation to ensure that it's reasonable
* Install git version of rails
  * Understand how to install via gem
  * Understand how to install from source
  * Use `diff -u` to inspect the two folders and see the difference

## Tuesday &mdash; 3/5/2013
### Topics
* Gem review (Authentication, Access Control, Search, Caching)

### Goals
* Grow our understanding of the Rails ecosystem

### Important Threshold Concepts
* Authentication vs Authorization

### Reading to do before class
* [Caching in Rails (Chapter 1)](http://guides.rubyonrails.org/caching_with_rails.html)

### Resources
* [Authentication Gems](https://www.ruby-toolbox.com/categories/rails_authentication)
* [Authorization Gems](https://www.ruby-toolbox.com/categories/rails_authorization)
* [Search Gems](https://www.ruby-toolbox.com/categories/rails_search)

### Code for the board
{% highlight ruby %}
# All these caches require production environment or `perform_caching=true` in development.rb.
# Page caching. Adds html file to public folder.
# entries_controller.rb
caches_page :index

# Action caching. Like page caching, but allows before_filters and conditionals
# entries_controller.rb
caches_action :index

# Fragment caching. Most common, usually used in views.
# views/entries/index.html.haml
- cache('some_name_here') do # This is difficult to expire without a name as the first argument
  = something_expensive()

# With memcached/Ehcache to do expiry
- cache('some_name_here', :expires_in => 5.minutes) do
  = something_expensive()
{% endhighlight %}

### Exercises

#### Warmup

* [#10 Gigasecond](https://github.com/JumpstartLab/warmup-exercises/tree/master/10-gigasecond)

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * What are the three caches for (page, action, fragment)
  * What's the difference between authorization and authentication?
  * Is Thinking-sphinx going to overtake Sunspot? Why?
  * Is OmniAuth or Devise going to win? Why?
  * In a haiku describe CanCan? (5-7-5)

#### Stage 2 (application/analyzing)

* Implement a website using auth from scratch [link to dropbox video file](link)
* Implement a website with Devise and CanCan

## Wednesday &mdash; 3/6/2013
### Topics
* Deployment

### Goals
* Deploy to Heroku like a champ
* Deploy to EC2 like a champ

### Reading to do before class
* [Capistrano docs](https://github.com/capistrano/capistrano)
* [AWS FAQ](http://aws.amazon.com/ec2/faqs/#What_is_Amazon_Elastic_Compute_Cloud_Amazon_EC2)
* [Read Bezos' Mandate](http://java.dzone.com/articles/getting-soa-right-%E2%80%93-thinking)
* [Read the Rap Genius article](http://venturebeat.com/2013/03/02/rap-genius-responds/)

### Exercises

#### Warmup

* [#12 Wordy Calculator](https://github.com/JumpstartLab/warmup-exercises/tree/master/12-wordy-calculator)

#### Stage 1 (remembering/understanding)

* Email me answers to these questions before the class begins. Highlight any that you didn't understand and couldn't ask about in the IRC room.
  * What is EC2?
  * What does Bezos' mandate mean for their architecture?
  * What other interesting systems exist in AWS? Why do you like them?
  * Does the Rap Genius article change your mind about using Heroku?

#### Stage 2 (application/analyzing)

* Heroku (short)
  * Download the heroku toolbelt
  * Get everyone on the team added to the project
  * Ensure that everyone can do `heroku logs -t`
  * (Optional) Ensure that everyone can deploy a project

* AWS EC2 (the fun part)
  * Register an account at `aws.amazon.com`
  * Add SSH Key pair with your `~/.ssh/id_rsa.pub` (use cmd+shift+G in finder to navigate)
  * Spin up a new micro instance w/ Amazon Linux AMI
  * Connect to your server via ssh (protip, right-click on the instance and hit connect for instructions)
  * Dabble around
  * (Optional) use capistrano to deploy code there [Maybe decent blog post?](http://haiyanggao.blogspot.com/2012/04/deploy-rails-app-to-amazon-ec2-with.html)
  * Terminate the instance, terminate the EBS volume (to prevent you from being charged)

#### Boss Fight (evaluation/creation)

* Find an AMI that's already ready for Ruby like Bitnami.
* Provision and deploy with this server
