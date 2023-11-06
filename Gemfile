source 'https://rubygems.org'

gem 'jekyll'

require 'json'
require 'net/http'
versions = JSON.parse(Net::HTTP.get(URI('https://pages.github.com/versions.json')))

gem 'github-pages', versions['github-pages']
