require './scripts/examerizer'

exam1 = Exam.new("Exam 1")

## HTML
# Create a basic html5 boilerplate without use of a template generator
# Create a bootstrap boilerplate without the use of a template generator
# Use lists, links, tables, images, div/spans
# Create valid forms with correct action/method attributes
# Create valid forms with linked labels
# Create valid forms with inputs using the name attribute
# Use id/class attributes to identify elements

section = Section.new("HTML")
exam1.sections << section

# Use lists, links, tables, images, div/spans
section.questions << Question.new(
  %{How do you define an bulleted list in HTML?},
  %{`<ul>`}, [
    %{`<list>`},
    %{`<ol>`},
    %{`<ls>`}])

section.questions << Question.new(
  %{Which of the following correctly uses a relative path?},
  %{`<a href="/cherries.html">Cherries</a>`}, [
    %{`<a href="http://www.google.com/">Google</a>`},
    %{`<a src="http://www.google.com/">Google</a>`},
    %{`<a src="/cherries.html">Cherries</a>`}])

section.questions << CodeQuestion.new(
  %{Which of the following correctly embeds an image from placekitten.com?},
  %{<img src="http://placekitten.com/100/100.png">}, [
    %{<image src="http://placekitten.com/100/100.png">},
    %{<img href="http://placekitten.com/100/100">},
    %{<img src="/images/placekitten.jpg">}], 'html')

# Create valid forms with inputs using the name attribute
section.questions << Question.new(
  %{What's wrong with this code: `<input type="text" id="name" placeholder="Enter your name"></input>`},
  %{It's missing the name attribute.}, [
    %{It's using the wrong type attribute, for names it should be textarea.},
    %{In HTML5, the input should be self-closing instead of using `</input>`},
    %{The placeholder attribute is experimental and shouldn't be used.}])

# Create valid forms with correct action/method attributes
section.questions << Question.new(
  %{What does the `action` attribute mean in a form tag?},
  %{It contains the URL to send data to.}, [
    %{It specifies whether to use GET or POST.},
    %{Action is not an attribute.},
    %{It specifies whether to validate or not.}])

# TODO: Create valid forms with linked labels
# TODO: Use id/class attributes to identify elements



# Short Answer

section.short_answers << ShortAnswer.new(%{Why do we keep CSS and HTML separate?})

# Project answers

# Create a basic html5 boilerplate without use of a template generator
section.project_answers << ProjectAnswer.new(%{Create a basic html5 boilerplate, called index.html, without use of a template generator})
# Create a bootstrap boilerplate without the use of a template generator
section.project_answers << ProjectAnswer.new(%{Create a bootstrap boilerplate, called index2.html, without the use of a template generator})

# section.questions << Question.new(
#   %{},
#   %{}, [
#     %{},
#     %{},
#     %{}])
# section.questions << CodeQuestion.new(
#   %{},
#   %{}, [
#     %{},
#     %{},
#     %{}], 'bash')
# section.short_answers << ShortAnswer.new(%{})
# section.project_answers << ProjectAnswer.new(%{})

section = Section.new("CSS")
exam1.sections << section

section.questions << Question.new(
  %{What is the difference between padding and margin?},
  %{Padding is inside the border, margin is outside.}, [
    %{Mostly spelling, they do the same thing.},
    %{Padding collapses when it gets near another element with padding.},
    %{Margin is only used on the sides and top of the window.}])

section.questions << Question.new(
  %{Why should you use a css normalizer?},
  %{Because all browsers are slightly different and normalize gives us a nice base.}, [
    %{To prevent browser manufacturers from breaking our site when users upgrade.},
    %{It allows us to nest CSS and use variables.},
    %{Because it makes all our colors match nicely.}])

section.questions << Question.new(
  %{How are css selectors weighted?},
  %{element: 1, class: 10, id: 100}, [
    %{attribute: 5, class: 20, id: 50},
    %{id: 1, class: 10, element: 100},
    %{p: 1, div: 10, html: 100}])

section.questions << Question.new(
  %{Why do we often place an id on the body?},
  %{So that we can scope our CSS and Javascript to a particular page}, [
    %{To ensure that our Javascript can't load up other pages},
    %{The browser needs it to correctly parse the URL},
    %{We don't, we can't put id's on the body element.}])

section.questions << Question.new(
  %{When you've floated several block-level items in a row, how do we prevent the following text from wrapping up around it?},
  %{By using a "clearfix" div wrapped around all the floated elements}, [
    %{By using the property, `clear: both`.},
    %{By using, `float: right` on the last item.},
    %{By putting the items inside a section or nav tag.}])

section.questions << Question.new(
  %{What's the best way to center content horizontally?},
  %{`margin: 0 auto`}, [
    %{`text-align: center`},
    %{`margin: auto`},
    %{`padding: -1`}])

# Short answer
# section.short_answers << ShortAnswer.new(%{Describe what these four css files are for and what types of declarations they contain: reset.css, responsive.css, global.css, pages.css?})
section.short_answers << LongAnswer.new(%{Draw out 4 diagrams that show 4 divs that are: `display: inline`, `display: block`, `display: inline-block`, and `float: left`})

section = Section.new("Javascript")
exam1.sections << section

section.questions << Question.new(
  %{How do you detect an undefined variable in Javascript safely?},
  %{`typeof a === 'undefined'`}, [
    %{`a.nil?`},
    %{`a == null`},
    %{`a === undefined`}])

section.questions << Question.new(
  %{If you declare a variable inside a function is it available outside that function?},
  %{No. It exists only inside the function.}, [
    %{Not unless you declare it globally like: `var global <name>`.},
    %{Yes. It will get placed on the window regardless of where you declare it.},
    %{Yes. But it will be undefined outside of the function.}])

section.questions << Question.new(
  %{If you declare a variable outside a function, but then declare it inside the function as well, what happens?},
  %{Any assignment to `a` inside the function will be lost after the function returns. It will shadow.}, [
    %{Any assignment to `a` will be copied to the outside variable. It will override.},
    %{Any assignment to `a` will be hoisted out of the function.},
    %{We will get a DuplicateVariableError.}])

# JSONP is not included in the basic section
# section.questions << Question.new(
#   %{If you only need to GET data, what's the easiest way to request it from another domain via AJAX?},
#   %{Using JSON-P.}, [
#     %{Just request directly.},
#     %{Using CORS and a Polyfill for old browsers.},
#     %{Using Ruby's net/http or httparty.}])

### Short Answer

section.short_answers << ShortAnswer.new(%{What does it mean to delay Javascript until domReady?})
# Prototypes not included in basic section
# section.short_answers << ShortAnswer.new(%{What is an Object prototype? Why do we use it?})

section = Section.new("Version Control")
exam1.sections << section

section.questions << Question.new(
  %{When we have untracked files in our working directory, how do we prepare them for committing?},
  %{`git add .`}, [
    %{`git add -m`},
    %{`git commit -am ""`},
    %{`git stage .`}])

section.questions << Question.new(
  %{When we want to clone a repo from Github, which command should we use?},
  %{`git clone git@github.com:vosechu/test.git`}, [
    %{`git clone origin vosechu/test`},
    %{`git init git@github.com:vosechu/test.git`},
    %{`git checkout vosechu/test`}])

section.questions << Question.new(
  %{When we push files to Github and it throws an error saying it can't 'fast-forward', what do we do?},
  %{`git pull origin master`}, [
    %{`git push -f origin master`},
    %{`git fast-forward master`},
    %{`git fetch origin`}])


### Short Answer

section.short_answers << ShortAnswer.new(%{Why do we use Git over some other method of sharing code?})
# section.short_answers << ShortAnswer.new(%{What is Rack and how is it related to Sinatra?})

section = Section.new("Ruby")
exam1.sections << section

section.questions << Question.new(
  %{Which values are falsey in Ruby?},
  %{`false, nil`}, [
    %{`false, '', 0`},
    %{`NaN, 0, '', [], false, nil`},
    %{just false, nothing else.}])

section.questions << Question.new(
  %{What is the difference between single and double quotes?},
  %{Single quotes don't allow us to use interpolation.}, [
    %{Single quotes don't allow us to change the string after creation.},
    %{Double quotes are only used for speeches.},
    %{Double quotes are output to the terminal.}])

section.questions << Question.new(
  %{If you want to iterate over an array without touching the original values, which function do you use?},
  %{`each`}, [
    %{`reduce`},
    %{`inject`},
    %{`for`}])

section.questions << Question.new(
  %{If you want to walk over an array and change each value, which function do you use?},
  %{`map`}, [
    %{`to_s`},
    %{`tap`},
    %{`call`}])

section.questions << Question.new(
  %{How do you make a new hash?},
  %{`a = {bob: 'my uncle'}`}, [
    %{`a = new Hash`},
    %{`a = Array.new.to_hash`},
    %{`a = ['bob' => 'my uncle']`}])

section.questions << Question.new(
  %{How do you make a class method?},
  %{`def self.happiness`}, [
    %{`def happiness`},
    %{`cdef happiness`},
    %{`def happiness(self)`}])

section.questions << Question.new(
  %{If you have a module `Happiness` and you want to import its methods, how should you do it?},
  %{`include Happiness`}, [
    %{`require 'Happiness'`},
    %{`import Happiness`},
    %{`Happiness.extend(self)`}])

section.questions << Question.new(
  %{What is the difference between a string and a symbol?},
  %{Symbols take up less memory and can't be changed.}, [
    %{Symbols use single quotes instead of double.},
    %{Strings use a colon in the front instead of quotes.},
    %{Symbols are the only thing we can use in hashes.}])

# Rack
# section.questions << Question.new(
#   %{What is the standard Rack response?},
#   %{`[status, headers, body]`}, [
#     %{`[status, body]`},
#     %{`body`},
#     %{`{:status => 200, :headers => {}, :body => body}`}])

section.questions << Question.new(
  %{When you need to get the current directory in Ruby, which of these work?},
  %{All of the above}, [
    %{`File.expand_path('.')`},
    %{`Dir.pwd`},
    %{`File.dirname(__FILE__)`},
    %{`__dir__` (ruby 2.0)}])


### Short Answer

section.short_answers << ShortAnswer.new(%{Why does Ruby have only two values that are false? Does that make life better or worse?})
section.short_answers << ShortAnswer.new(%{What is the difference between a class method and an instance method?})
section.short_answers << ShortAnswer.new(%{What's the difference between a Hash and an Array?})
# section.short_answers << ShortAnswer.new(%{What is TDD and why do we practice it?})
# section.short_answers << ShortAnswer.new(%{What is Pair Programming and why do we practice it?})

# section = Section.new("Servers")
# exam1.sections << section

# # Short Answer

# section.short_answers << ShortAnswer.new(%{Draw and label what happens when we make a request to http://www.google.com.})

puts exam1.to_s