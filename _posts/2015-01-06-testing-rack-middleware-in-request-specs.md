---
layout: post
categories: tech
title: Testing rack middleware in a request spec
---

## Introduction

This may be a controversial thing, but I found it to be useful and difficult to research so I'm going to post about it. For the record, it's probably ill-advised to test the effects of a middleware since presumably the middleware itself has bountiful tests (or maybe you should send in a PR!), but we wanted to TDD this and make sure that the middleware was really getting applied the way we thought it was.

Crux of the story: We have a border service which acts as API endpoint for everything, but also as the first line of defense. We escape all the user-provided code on output, but it would be nice if it was scrubbed before it even got into our safe-haven inside the firewall. When I talked to a couple security friends they said that the industry standard is just to escape, but if you have the means, scrubbing on the way in would be great.

For clarity, we'll say escaping is the process of neutering tags by turning them into &amp;amp; representations them, while scrubbing is the process of removing tags and offensive properties entirely.

## Testing middlewares

Testing middleware is a little weird, there's some things you should know in order to begin. First off, Rack::Test (which you're probably using for your request specs and not realizing it) doesn't actually make real requests to a webserver. This probably shouldn't shock you, but it is surprising. Capybara on the other hand, will hit a real server (in most cases?) but is also capable of using Rack::Test to skip that step. 

Even if Capybara does his a real server, the server it boots often doesn't use the `config.ru` because that is sometimes used to represent just the production environment. We use config.ru for all environments because we use Pow. 

So in order to get Rack::Test to see the config.ru you'll have to manually load it like so:

```ruby
# Ensure that the config.ru gets loaded before these tests
let(:app) {
  Rack::Builder.new do
    eval File.read(Rails.root.join('config.ru'))
  end
}
```

For greater context, here's what it looked like in the test file (Rory is a little rack server we use internally):

```ruby
RSpec.describe 'XSS sanitization', :type => :feature do
  class EchoController < ApplicationController
    def echo
      @response = [200, {'Content-Type' => 'application/json'}, [params.to_json]]
    end
  end

  # Ensure that the config.ru gets loaded before these tests
  let(:app) {
    Rack::Builder.new do
      eval File.read(Rory.root.join('config.ru'))
    end
  }

  before(:each) do
    Nemo::Application.routes << Rory::Route.new('/echo', :to => 'echo#echo')
  end

  let(:body_hash) { JSON.parse(last_response.body) }

  it 'properly sanitizes obvious but naughty xss attacks' do
    post '/echo', { 'address' => '<script>obvious_post();</script>'}

    expect(body_hash['address']).to eq('obvious_post();')
  end
end
```
