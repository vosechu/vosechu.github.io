require './scripts/examerizer'

exam1 = Exam.new("Week 1 &mdash; Exam")

section = Section.new("Fluffy")
exam1.sections << section

section.short_answers << ShortAnswer.new(%{List 3 of your favorite keyboard shortcuts and what they do?})
section.short_answers << ShortAnswer.new(%{List 3 of your favorite command-line programs and what they do?})
section.short_answers << ShortAnswer.new(%{If your favorite command-line program was a vegetable, what would it be and why?})
section.short_answers << ShortAnswer.new(%{Write a short bio about yourself.})
section.short_answers << ShortAnswer.new(%{Take a quick photo (or use your favorite) and email it to me and Erica.})
section.short_answers << ShortAnswer.new(%{Take a photo of the front and back of your license/passport and send it to Erica.})

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

# Create valid forms with linked labels
section.questions << Question.new(
  %{What does the `for` attribute mean in a label tag?},
  %{It links the label to an input via the input's id attribute.}, [
    %{It links the label to an input via the input's name attribute.},
    %{It tells browsers what the input is used for (eg: date, password, etc).},
    %{It is a deprecated attribute that was used in XHTML1.1 only.}])

# Use id/class attributes to identify elements
section.questions << Question.new(
  %{Can you use the same id multiple times on a website?},
  %{No. Behavior will vary between browsers and it might crash entirely.}, [
    %{Yes. As long as the elements are in separate `section` elements.},
    %{No. All browsers will throw an error immediately if you do this.},
    %{Yes. All browsers can handle this problem easily.}])

section.questions << Question.new(
  %{How to you specify multiple classes on an element? (IE7+)},
  %{Separate the class names with a space inside the class attribute.}, [
    %{Separate the class names with a comma inside the class attribute.},
    %{This isn't possible, elements can only have one class at a time.},
    %{This isn't wise because IE can only read the first class specified.}])

# Short Answer

section.short_answers << ShortAnswer.new(%{Why do we keep CSS and HTML separate?})

# Project answers

# Create a basic html5 boilerplate without use of a template generator
section.project_answers << ProjectAnswer.new(%{Create a basic boilerplate html file (just the index.html) without any css files.})
section.project_answers << ProjectAnswer.new(%{Include an HTML5 Doctype.})
section.project_answers << ProjectAnswer.new(%{Include an html, head, body, and title tag.})
section.project_answers << ProjectAnswer.new(%{Add a header tag which includes an h1 and an image tag with an alt attribute})
section.project_answers << ProjectAnswer.new(%{Add an aside which includes 3 links. One should use a relative link, one should use an absolute link, and the last should link to an id on the page.})
section.project_answers << ProjectAnswer.new(%{Add an article tag which includes 3 paragraphs of text (lorem ipsum generator)})
section.project_answers << ProjectAnswer.new(%{Inside the article, add a bulleted list and a numbered list})
# section.project_answers << ProjectAnswer.new(%{Add a section tag after the article which includes a form})
section.project_answers << ProjectAnswer.new(%{Add a form tag inside the article})
section.project_answers << ProjectAnswer.new(%{Use attributes on the form tag to submit data via GET to the url '/contact/submit'})
section.project_answers << ProjectAnswer.new(%{Inside the form create a label and a text input. Link them with the `for` attribute})
# section.project_answers << ProjectAnswer.new(%{Inside the form create a textarea with initial content of "Hello world!"})
section.project_answers << ProjectAnswer.new(%{Inside the form create a submit button with the word "Activate!" on the button})
# section.project_answers << ProjectAnswer.new(%{Add a footer tag which includes the text "&copy; 2013"})

section = Section.new("CSS")
exam1.sections << section

# Understand margin vs padding
section.questions << Question.new(
  %{What is the difference between padding and margin?},
  %{Padding is inside the border, margin is outside.}, [
    %{Mostly spelling, they do the same thing.},
    %{Padding collapses when it gets near another element with padding.},
    %{Margin is only used on the sides and top of the window.}])

# Implement an HTML structure informed by a CSS framework or style-guide
section.questions << Question.new(
  %{Why should you use a css normalizer?},
  %{Because all browsers are slightly different and normalize gives us a nice base.}, [
    %{To prevent browser manufacturers from breaking our site when users upgrade.},
    %{It allows us to nest CSS and use variables.},
    %{Because it makes all our colors match nicely.}])

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

# Understand weighting and cascade
section.questions << Question.new(
  %{How are css selectors weighted (higher is more important)?},
  %{element: 1, class: 10, id: 100}, [
    %{attribute: 5, class: 20, id: 50},
    %{id: 1, class: 10, element: 100},
    %{p: 1, div: 10, html: 100}])

# Be able to center content
section.questions << Question.new(
  %{What's the best way to center content horizontally?},
  %{`margin: 0 auto`}, [
    %{`text-align: center`},
    %{`margin: auto`},
    %{`padding: -1`}])

# Short answer
# Discuss the differences between block and inline
# section.short_answers << LongAnswer.new(%{Draw out 4 diagrams with the following base CSS/HTML:

# HTML:
# `<div></div><div></div><div></div><div></div>`

# CSS:
# `div { width: 100px; height: 100px; border: 1px solid black }`

# For each diagram, assume this additional css is inserted after the base styles. What does this look like in the browser?
# 1. `div { display: inline; }`
# 2. `div { display: block; }`
# 3. `div { display: inline-block; }`
# 4. `div { float: left }`})

# Include external stylesheets
# Include vendor provided frameworks
# Use IDs and classes to reference styles in an external stylesheet
# Be able to do simple floats
section.project_answers << ProjectAnswer.new(%{Create a basic boilerplate html file (just the index.html) without any css files and without using a template generator.})
section.project_answers << ProjectAnswer.new(%{Download the bootstrap files and link them in your head tag (don't link the JS yet).})
section.project_answers << ProjectAnswer.new(%{Create the HTML structure needed to enable the bootstrap grid.})
section.project_answers << ProjectAnswer.new(%{Inside your container div, add some placeholder text and heading tags from h1-h4.})
section.project_answers << ProjectAnswer.new(%{Insert an image and have the text wrap around it on the right.})
section.project_answers << ProjectAnswer.new(%{Create an external stylesheet called global.css and link it from the html file.})
section.project_answers << ProjectAnswer.new(%{Give the container div nice light green background.})
section.project_answers << ProjectAnswer.new(%{Give the heading tags a white color.})
section.project_answers << ProjectAnswer.new(%{Create four divs with the class "squad", make them 100x100, give them a background color of white.})
section.project_answers << ProjectAnswer.new(%{Give each div 20px of margin, and arrange them into a square (2x2). These do not need to be centered.})

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
  %{If you want to aggregate all data from an array into one value, which function do you use?},
  %{`reduce`}, [
    %{`to_s`},
    %{`tap`},
    %{`call`}])

section.questions << Question.new(
  %{How do you make a new hash?},
  %{`a = {bob: 'my uncle'}`}, [
    %{`a = new Hash`},
    %{`a = Array.new.to_hash`},
    %{`a = ['bob' => 'my uncle']`}])

# section.questions << Question.new(
#   %{How do you make a class method?},
#   %{`def self.happiness`}, [
#     %{`def happiness`},
#     %{`cdef happiness`},
#     %{`def happiness(self)`}])

# section.questions << Question.new(
#   %{How do you make an instance method?},
#   %{`def happiness`}, [
#     %{`def self.happiness`},
#     %{`cdef happiness`},
#     %{`def happiness(self)`}])

# section.questions << Question.new(
#   %{How do you call a class method (class Emotion)?},
#   %{`Emotion.happiness`}, [
#     %{`happiness`},
#     %{`@emotion.happiness`},
#     %{`Emotion.send(:happiness(self))`}])

# section.questions << Question.new(
#   %{How do you call an instance method (class Emotion)?},
#   %{`@emotion.happiness`}, [
#     %{`happiness(Emotion)`},
#     %{`Emotion.happiness`},
#     %{`Emotion.send(:happiness(self))`}])

# section.questions << Question.new(
#   %{If you have a module `Happiness` and you want to import its methods, how should you do it?},
#   %{`include Happiness`}, [
#     %{`require 'Happiness'`},
#     %{`import Happiness`},
#     %{`Happiness.extend(self)`}])

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

# section.questions << Question.new(
#   %{When you need to get the current directory in Ruby, which of these work?},
#   %{All of the above}, [
#     %{`File.expand_path('.')`},
#     %{`Dir.pwd`},
#     %{`File.dirname(__FILE__)`},
#     %{`__dir__` (ruby 2.0)}])


### Short Answer

# section.short_answers << ShortAnswer.new(%{What is the difference between a class and an instance of a class?})
# section.short_answers << ShortAnswer.new(%{What is the difference between a class method and an instance method?})
# section.short_answers << ShortAnswer.new(%{When considering making a method, when should you use a class method and when should you use an instance method?})
# section.short_answers << ShortAnswer.new(%{What is the difference between an instance variable and a local variable?})
# section.short_answers << ShortAnswer.new(%{What is a post-conditional and how can we use it with `return` to guard expensive computations?})
# section.short_answers << LongAnswer.new(%{Create })
section.short_answers << ShortAnswer.new(%{What are the three styles of pairing (that I talked about) and which do you use for which pair of archetypes? [Tuesday notes](http://chuckvose.com/exercises/session2/week1/tuesday.html)})
section.short_answers << ShortAnswer.new(%{What are the steps for developing an algorithm? [Wednesday notes](http://chuckvose.com/exercises/session2/week1/wednesday.html)})
section.short_answers << ShortAnswer.new(%{What are the three types of bugs and what is an example of each? Which debugging methods would you try for each one? [Thursday notes](http://chuckvose.com/exercises/session2/week1/thursday.html)})

# Project questions

section.project_answers << ProjectAnswer.new(%{Create a new ruby file called twixt.rb})
section.project_answers << ProjectAnswer.new(%{Inside twixt create a class called Twixt.})
section.project_answers << ProjectAnswer.new(%{Create a class method called "shout" that takes 2 arguments and simply outputs both arguments followed by "Woo woo!" to the command line.})
section.project_answers << ProjectAnswer.new(%{Create an instance method called "twist" that takes 0 arguments and calls the shout method.})
section.project_answers << ProjectAnswer.new(%{Create an initializer (aka constructor) method on the class that takes 1 argument and assigns it to an instance variable "pound".})
section.project_answers << ProjectAnswer.new(%{Create an instance method "pound" which returns the instance variable pound})

# section.project_answers << ProjectAnswer.new(%{Outside the class, create a function called "bazinga", that creates a new Twixt object and calls the twist method.})
# section.project_answers << ProjectAnswer.new(%{Inside "bazinga", also have it puts the value of the instance variable called "pound".})
# section.project_answers << ProjectAnswer.new(%{Outside the function declaration, call the function "bazinga".})

# section = Section.new("Servers")
# exam1.sections << section

# # Short Answer

# section.short_answers << ShortAnswer.new(%{Draw and label what happens when we make a request to http://www.google.com.})

section = Section.new("Version Control")
exam1.sections << section

section.questions << Question.new(
  %{When we have untracked files in our working directory, how do we prepare them for committing?},
  %{`git add .`}, [
    %{`git init -m`},
    %{`git commit --force-add -m ""`},
    %{`git stage .`}])

# TODO: This should reference adding the remote and pulling now
section.questions << Question.new(
  %{When we want to clone a repo from Github, which command should we use?},
  %{`git init; git remote add git@github.com:vosechu/test.git; git pull -u origin master`}, [
    %{`git clone origin vosechu/test; git pull vosechu/test`},
    %{`git init git@github.com:vosechu/test.git`},
    %{`git checkout vosechu/test; git pull vosechu/origin`}])

section.questions << Question.new(
  %{When we push files to Github and it throws an error saying it can't 'fast-forward', what do we do?},
  %{`git pull origin master`}, [
    %{`git push -f origin master`},
    %{`git fast-forward master`},
    %{`git fetch origin`}])

### Short Answer

# section.short_answers << ShortAnswer.new(%{Why do we use Git over some other method of sharing code?})
# section.short_answers << ShortAnswer.new(%{How do you create a repo and pull down the initial code?})
section.short_answers << ShortAnswer.new(%{What are the three commands we use to save code changes and send them to Github? (70% of all the commands I type)})
# section.short_answers << ShortAnswer.new(%{What is Rack and how is it related to Sinatra?})


puts exam1.to_s