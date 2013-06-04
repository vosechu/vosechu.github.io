### Topics
* Regular Expressions & Routes in Sinatra

### Goals
* To understand how to create some basic regexes
* To use these regexes in our Sinatra app
* Understand why regex is important

### Reading to do before class
* [Regex on Code Academy](http://www.codecademy.com/courses/javascript-intermediate-en-NJ7Lr)
* [Regex lesson+video on NetTuts+](http://net.tutsplus.com/tutorials/ruby/ruby-for-newbies-regular-expressions/)
* [Concise Regex advice on SO](http://stackoverflow.com/a/2759417/203731)
* [Fairly complete chart of regex](http://stackoverflow.com/a/2759424/203731)
* [Using Regex to parse XML (summons Cthulu)](http://stackoverflow.com/a/1732454/203731)
* [Part 1: Regex tutorial](http://neverfear.org/blog/view/12/Regex_tutorial_for_people_who_should_know_Regex_but_do_not_Part_1)
* [Part 2: Regex tutorial](http://neverfear.org/blog/view/14/Regex_tutorial_for_people_who_should_know_Regex_but_do_not_Part_2)

### Resources
* [Ruby Regex tester](http://www.rubular.com/)
* [Regex cheat sheet](http://www.cheatography.com/davechild/cheat-sheets/regular-expressions/)
* [Whether to parse XML with Regex (analysis)](http://www.codinghorror.com/blog/2009/11/parsing-html-the-cthulhu-way.html)
* [Readable Regexes](http://stackoverflow.com/a/4053506/203731)
* [EBNF expression syntax](http://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_Form)

### Helpful Commands
{% highlight bash %}
# in place editing of a file
perl -pi -e 's/foo/bar/gi' /home/smith/myfile.txt

# egrep gives us more options when searching through network connections
ps ax | grep ruby # ruby is actually a really simple regex here
netstat -an | grep 'tcp[46]*' | egrep '(LISTEN|CLOSE_WAIT)'

# like perl -pi, sed allows in place editing of text. In this case it's removing an IP address so I can get a list of open ports
netstat -an | grep tcp | awk '{print $4}' | sed -E "s/.*[\.:]([0-9]+)$/\\1/" | sort -un | grep -v '*.*'

# Find out how much batter you have
pmset -g ps | tail -1 | sed -E 's/.*?(\d+)%.*/\1/'
{% endhighlight %}

### Exercises

#### Stage 1 (remembering/understanding)

* Answer these questions with your pair
  * Why are regexes awesome?
  * What are some of the most common uses of regexes?
  * What is a character class?
  * How do I count in regex?
  * How do I group (and what does this mean for replacement)?
  * What is greed and how do you use regex-fu to curtail it?

#### Stage 2 (application/analyzing)

* [Create a regex that can validate whether](https://gist.github.com/vosechu/5025463):
  * We've been given a valid phone number
  * We've been given a valid email address (not fully RFC822 compliant though!)
  * We've been given a recipe in metric
* Using regexes in Sinatra
  * Define a route like `get %r{/hello/([\w]+)}`.
  * Why do we have to use `%r{}` instead of `//` like in normal ruby?
  * Make a route that only works for Chrome and one that only works for Curl. Use the agent syntax: `get '/foo', :agent => /.*/ do`
  * Create a before filter that `halt`s if `request.path_info` contains the word 'cats'

#### Boss Fight (evaluation/creation)

* Since we're not allowed to use Regexes on HTML, what are some alternatives?
* What's the current state of the art for parsing with XPATH? With CSS selectors? With something else?