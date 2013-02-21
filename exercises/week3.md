---
layout: page
---

## Day 11 &mdash; 2/18/2013
### Monday Stuff
* Announcements
* Network points awards
* Networking events for the week
* Call for lightning talks

### Monday comprehension questions
* How do you install and start a middleman project?
* How do you specify a page title in a template?
* What is the normal git commit process?
* What is a pull request?
* Why do you need to make a method called `each` when you include Enumerable?
* What is the difference between a class method and an instance method?
* What is a clearfix?
* How do you center content?

### Weekly Theme
* Creating an interactive Jekyll blog to host on Github Pages
* Create a Rack server which can process data and be validated with an automated test suite

### Weekly Home<del>work</del>**fun**
* 3rd Blog post. 1-2 pages (500-1000 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* Jekyll blog on Github pages with your three blog posts, links to your resume in html and pdf format, and an index page with placeholders for your favorite repos/code samples.

## Day 11 &mdash; 2/18/2013
### Topics
* Javascript

### Goals
* Understand the intricacies of the `var` keyword
* Understand block scopes, hoisting, and shadowing
* Understand how to detect undefined correctly

### Important Threshold Concepts
* Scoping

### Reading to do before class
* Javascript Deep Dive Variables, Numbers, Strings, Arrays

### Resources
* [https://gist.github.com/vosechu/4972906](https://gist.github.com/vosechu/4972906)
* [http://teamtreehouse.com/library/websites/javascript-foundations](http://teamtreehouse.com/library/websites/javascript-foundations)
* [http://www.codecademy.com/tracks/javascript](http://www.codecademy.com/tracks/javascript)
* [http://addyosmani.com/blog/essential-js-namespacing/#beginners](http://addyosmani.com/blog/essential-js-namespacing/#beginners)

### Helpful Commands
* ⌘ + ⌥ + J to open the console in chrome
* ⌘ + ⇧ + U to open the page source
* `debugger` anywhere in your javascript file

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your pair
  * How to make a variable that contains an integer, float, string, and array
  * How do you stop the browser and enter debugging mode?
  * What does it mean to `continue`, `step over`, and `step into` when in debugging mode?
  * How do you safely detect whether a variable has been defined or null?
  * How do you check whether a variable is empty?
  * <> Insert examples that demonstrate Overriding, Hoisting, Shadowing, and Scoping
  * What does it mean to be "function scoped"?

#### Stage 2 (application/analyzing)
* Write code on the board (or on paper), which has a function nested within a function. Annotate the different block scopes. Instead of a nested function, use an if statement, then annotate the block scopes.
* Using the gist above, simulate overriding, hoisting, shadowing, and scoping.
* Without using jQuery, create a ‘rock, paper, scissors, lizard, Spock’ application. Using prompt() ask the user to input their choice. The computer should always choose 'Spock' because it's the most awesome answer. Declare victory or loss.
  * Things you may need: `prompt`, `alert`, `console.log`, `debugger`, `switch`

#### Boss Fight (evaluation/creation)
* Install an automatic JS Linter into Sublime. Write up instructions and put them on the wiki on a page called Week 3.
* Evaluate the types of namespacing in Addy Osmani’s article. Defend your choice to the class and explain why namespacing is important during reflection time.
* Finish up the app above by allowing the computer to randomly select. Allow repeated plays. Ensure that you see the computer select all 5 possible actions!

## Day 12 &mdash; 2/19/2013
### Topics
* Rack
* Form Processing

### Goals
* Understand the basics of Rack
* Understand POST vs GET
* Post data from a form to a server

### Important Threshold Concepts
* Common gateway interfaces
* What is an app server

### Reading to do before class
* [http://vimeo.com/46906591](http://vimeo.com/46906591) (up to about minute 25 or farther if you’re interested)

### Resources
* [https://gist.github.com/vosechu/4972929](https://gist.github.com/vosechu/4972929)
* [http://chneukirchen.org/blog/archive/2007/02/introducing-rack.html](http://chneukirchen.org/blog/archive/2007/02/introducing-rack.html)
* [http://rack.rubyforge.org/doc/classes/Rack/Request.html](http://rack.rubyforge.org/doc/classes/Rack/Request.html)
* [https://github.com/rack/rack/wiki/list-of-middleware](https://github.com/rack/rack/wiki/list-of-middleware)
* [http://en.wikipedia.org/wiki/Rack_(web_server_interface)][1]
* [http://en.wikipedia.org/wiki/Wsgi](http://en.wikipedia.org/wiki/Wsgi)
* [http://en.wikipedia.org/wiki/PSGI](http://en.wikipedia.org/wiki/PSGI)

### Helpful Commands
{% highlight bash %}
rackup -p 4568
gem install thin; rackup -s thin
brew install curl
curl -X POST -H "Content-type application/x-www-form-urlencoded" -d "key=value" -d "key2=value2" http://localhost3001
{% endhighlight %}

### Exercises
#### Stage 1 (remembering/understanding)
* Answer these questions with your pair
  * What is the one function that every Rack app must include?
  * What must the hash look like when the main Rack function returns?
  * Why was Rack created?
  * What is the difference between POST and GET?
  * How do you get the values that were submitted to a Rack app?

#### Stage 2 (application/analyzing)
* Create a file reader Rack application
  * Start with a Hello World app that just responds with text.
  * Place an index.html in the same folder. Using `File.read` pull in the data in the index.html and assign it to a variable.
  * If `File.read` worked and your variable is full of data, return a 200 response with the html as the third argument. Otherwise return a 404 response.
  * Once you have it reading and responding with a file, use `Rack::Request#path` to find a file on your system.
    * Try using `puts File.dirname(__FILE__) + request.path`. When you next refresh your browser check the terminal to see what is printed out.
    * If `path` returns '/', make it look for an index.html.
    * If `path` returns something that ends in .html, use that as the path for `File.read`.
  * Now that you have a Rack app that responds with a file, you've basically made the Internet! Congratulations!
* POSTing and GETing
  * Create a Rack app that prints the values from Rack::Request#params.
  * In your browser, add '?chunky=bacon&pcs=rocks' to your url. This is a GET request.
  * From your terminal use curl to create a POST request. Or create a form with method="POST" and submit it.

#### Boss Fight (evaluation/creation)
* Use the RackTidy middleware to tidy up your HTML markup after it’s created. Document how you installed this module and any configuration options you needed to run it.
* Find 3 other Rack Middlewares that are interesting and tell us about them during the reflection time.
* Try to read through the code in TryStatic, what is it doing? Make a comment between each line with what you think is happening and share with your partner.
* Try running Rack with an app server other than Webrick. Thin and Mongrel are popular choices.

## Day 13 &mdash; 2/20/2013
### Topics
* Ruby Modules/Core Ruby/StdLib
* Testing

### Goals
* Understand include/extend
* Understand how to autorun tests
* Understand how to run tests from a separate file

### Important Threshold Concepts
* Testing techniques
* Symbol vs String

### Reading to do before class
* Ruby Deep Dive (Modules, Ruby Core, Std Lib, Testing)

### Resources
* [https://gist.github.com/vosechu/4972953](https://gist.github.com/vosechu/4972953)
* [https://github.com/vosechu/pcs_examples/blob/master/hq9f/hq9f.rb](https://github.com/vosechu/pcs_examples/blob/master/hq9f/hq9f.rb)
* [http://apidock.com/ruby](http://apidock.com/ruby)
* [http://www.ruby-doc.org/docs/ProgrammingRuby/ (Pickaxe)](http://www.ruby-doc.org/docs/ProgrammingRuby/)
* [https://github.com/rubinius/rubinius/tree/master/lib/19](https://github.com/rubinius/rubinius/tree/master/lib/19)
* [http://blog.rubybestpractices.com/posts/rklemme/017-Struct.html](http://blog.rubybestpractices.com/posts/rklemme/017-Struct.html) (Scroll down to “Struct vs. OpenStruct vs. Hash”)

### Helpful Commands
{% highlight bash %}
gem install watchr
watchr test.watchr
{% endhighlight %}

### Exercises
#### Stage 1 (remembering/understanding)
* Answer these questions with your pair
  * What is the difference between an instance method and a class method?
  * How do I write a module that adds instance methods?
  * How do I write a module that adds class methods?
  * How do I get these methods into my class and instance?
  * What is the value of testing over personally validating the output?
  * How do I write tests in the same file I’m working in?
  * How do I write tests in an external file or files?
  * What is a symbol and why do we use them?
  * What is a struct and why would I use it over a class?

#### Stage 2 (application/analyzing)
* Go back to your HQ9F class from week2 and add autorun tests to it. Verify that h, HQ9F._99, and HQ9F.new.f all work with a variety of inputs. Try to use assert_output or capture_io.
* Which cases did I miss in my testing? Write a test for some of those cases.

#### Boss Fight (evaluation/creation)
* Attempt to integrate Watchr or autotest to automatically run your tests. Optionally get this working with Growl so you don’t even have to leave your editor. (You may need the gem rb-fsevent). Write up documentation about what watchr script you wrote and put it on the wiki.
* Download the Rubinius or Ruby source and look through the lib or ext folders and find 3 other modules that might be interesting to include/extend. Tell us about these modules in reflection time.

## Day 14 &mdash; 2/21/2013
### Topics
* Jekyll
* Markdown/Textile/Other formatters
* Liquid

### Goals
* Installing Jekyll and getting it running on Github Pages.

### Important Threshold Concepts
* None

### Reading to do before class
* [https://github.com/mojombo/jekyll](https://github.com/mojombo/jekyll)
* [http://liquidmarkup.org/](http://liquidmarkup.org/)
* [http://daringfireball.net/projects/markdown/syntax](http://daringfireball.net/projects/markdown/syntax)

### Resources
* [http://matthodan.com/2012/10/27/how-to-create-a-blog-with-jekyll.html](http://matthodan.com/2012/10/27/how-to-create-a-blog-with-jekyll.html)
* [https://help.github.com/categories/20/articles](https://help.github.com/categories/20/articles)
* [https://github.com/mojombo/jekyll/wiki/install](https://github.com/mojombo/jekyll/wiki/install)
* [https://help.github.com/articles/using-jekyll-with-pages](https://help.github.com/articles/using-jekyll-with-pages)
* [https://github.com/mojombo/jekyll/wiki/sites](https://github.com/mojombo/jekyll/wiki/sites)
* [https://github.com/mojombo/jekyll/wiki/Plugins](https://github.com/mojombo/jekyll/wiki/Plugins)
* [https://github.com/vosechu/vosechu.github.com/commit/843f3b349f3c6f84eec5b7306059f3d7301bd73b](https://github.com/vosechu/vosechu.github.com/commit/843f3b349f3c6f84eec5b7306059f3d7301bd73b)
* [https://github.com/mojombo/jekyll/wiki/Pagination](https://github.com/mojombo/jekyll/wiki/Pagination)

### Helpful Commands
{% highlight bash %}
gem install jekyll
jekyll --server --auto
brew install python
# export PATH="/usr/local/share/python${PATH}"
easy_install pip
pip install --upgrade distribute
pip install pygments
{% endhighlight %}

### Exercises
#### Stage 1 (remembering/understanding)
* Answer these questions with your pair
  * Why do people like markdown over wysiwyg editors?
  * What is a template engine like Liquid? How does it normally work outside of Jekyll (How do you compile a template and pass it values)?
  * How does Liquid compare to a Lambda?
  * What are some most common Markdown syntax elements?
  * What is a permalink?
  * What are the basic steps for getting hosting on Github?

#### Stage 2 (application/analyzing)
* Enable your Github page with a default theme. Download this theme and convert it to Jekyll.
* Once you have your Jekyll site, add in your two blog posts from earlier homework (they don’t have to stay here, but it’s content so we can get on with the exercise).
* Enable pagination, tagging, or some other common element.
* Check that your permalinks are working the way you expect

#### Boss Fight (evaluation/creation)
* Research Liquid and find 3 liquid tags that are useful for your blog. Write these down and explain them during reflection time.
* Research and evaluate the quality of at least 3 Jekyll plugins. Look also at the listed Jekyll sites and find out which plugins are commonly used. Install these plugins and document any configuration in the wiki.
* Include Disqus in your blog posts to enable commenting. Document the steps or link to articles that you found relevant in the wiki.

## Day 15 &mdash; 2/22/2013
* Wrapping it all up
* Review of the week
* Retrospective
* 1-on-1’s / Catchup time
* Networking points report
* Go
* Teambuilding

[1]: http://en.wikipedia.org/wiki/Rack_(web_server_interface)