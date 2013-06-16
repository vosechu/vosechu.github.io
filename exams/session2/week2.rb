require './scripts/examerizer'
include Examerizer

exam = Exam.new("Week 2 &mdash; Exam", 1)

section = Section.new("Fluffy")
exam.sections << section

section.short_answers << ShortAnswer.new(%{})

section = Section.new("Ruby")
exam.sections << section

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

section.questions << Question.new(
  %{What is the difference between a string and a symbol?},
  %{Symbols take up less memory and can't be changed.}, [
    %{Symbols use single quotes instead of double.},
    %{Strings use a colon in the front instead of quotes.},
    %{Symbols are the only thing we can use in hashes.}])

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

section = Section.new("Version Control")
exam.sections << section

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

section.short_answers << ShortAnswer.new(%{What are the three commands we use to save code changes and send them an existing repo on Github? (70% of all the commands I type)})

section = Section.new("Testing Fundamentals")
exam.sections << section

section.short_answers << ShortAnswer.new(%{})

puts exam.to_s