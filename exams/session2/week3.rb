require './scripts/examerizer'

exam1 = Exam.new("Week 3 &mdash; Exam")


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

section.questions << Question.new(
  %{What is a callback?},
  %{A function which we want to run after something happens.}, [
    %{A special data structure that allows message passing after code is run.},
    %{A symbol that identifies an object.},
    %{A trick you do after a job interview to confuse your interviewers.}])

section.questions << Question.new(
  %{What are some common data types in JS?},
  %{Number, String, Boolean, Function, Object, Null, Undefined}, [
    %{String, Fixnum, NilClass, Hash, Symbol},
    %{Boolean, Integer, Float, String, Tuple, Nil, List, Set, Dictionary},
    %{Byte, Short, Int, Long, Float, Double, Boolean, Char}])

### Short Answer

section.short_answers << ShortAnswer.new(%{What does it mean to delay Javascript until the document is ready?})

# Project Answers

section.project_answers << ProjectAnswer.new(%{Use a template generator to create a base project (or create a basic index.html)})
section.project_answers << ProjectAnswer.new(%{Include jQuery from a CDN. Also include jQuery migrate.})
section.project_answers << ProjectAnswer.new(%{Create a local js file (called head.js) and link it from inside the head tag of your document})
section.project_answers << ProjectAnswer.new(%{Create a local js file (called foot.js) and link to it from the end of the body tag of your document})
section.project_answers << ProjectAnswer.new(%{Create a div somewhere with the id: "content", inside this add a div with id: "steve", a paragraph of text, and a button.})
section.project_answers << ProjectAnswer.new(%{In the head.js, use jQuery to find the "steve" div and add the class "squiggly"})
section.project_answers << ProjectAnswer.new(%{In the foot.js, use jQuery to add a click handler to the button that shows or hides the div with class "squiggly"})
