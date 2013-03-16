---
layout: page
body_classes: exercise
title: Week 2 &mdash; Overview
---

### Monday Stuff
* How was the weekend?
* Announcements
* Network points awards
* Networking events for the week
* Call for lightning talks

### Monday comprehension questions
* TODO

### Weekly Topics
* Git/Github
* HTML w/ Middleman
* CSS3
* Ruby: Classes, modules

### Weekly Theme
* TODO

### Weekly Home<del>work</del>**fun**
* Email me a link to your 2nd Blog post. 1-2 pages (250-500 words) about your week, what you learned, something funny that happened or something about the technologies we talked about.
* TODO

## Monday &mdash; 2/11/2013
### Topics
* Git and Github

### Goals
* TODO

DELETEME
### Important Concepts
* Version control
* Git/github
* Diffs and merging
* Conflicts

### Important Threshold Concepts
* Git is a graph, branches are just labels

### Reading to do before class
* [http://try.github.com](http://try.github.com)

### Resources
* [https://help.github.com/articles/generating-ssh-keys](https://help.github.com/articles/generating-ssh-keys)
* [https://help.github.com/](https://help.github.com/)
* [https://github.com/defunkt/hub](https://github.com/defunkt/hub)

### Helpful Commands
{% highlight bash %}
# Normal git process
git add .
git commit -m "my commit message"
git push origin master

# Cloning a new repo from github
# Copy the SSH link from github: git@github.com:username/repo_name.git
git clone git@github.com:username/repo_name.git

# Adding your files to a new repo
git init
git add .
git commit -m "initial commit"
# Copy the SSH link from github: git@github.com:username/repo_name.git
git remote add origin git@github.com:username/repo_name.git
git pull origin master # This pulls down the .gitignore and the README.md
git push origin master
{% endhighlight %}

TODO Refactor to stages
### Exercises
#### Easy
* Generate an ssh key and upload it to your account on github. Test it out with `ssh -T git@github.com`
* Add a repo, check it out locally, move your files in. Let github generate a .gitignore file for you.
* Create some text files with at least 3 lines in them. Add, commit, and push them to github.
* Edit these files. Add, commit, then push to github. Look at the commits tab to see what a diff is.
* Edit these files on github directly. Edit some other line in the same file locally then try to add, commit, and push. Pull down changes then push.
* Edit on github again, but this time edit the same line locally. Try to add, commit and push. Pull down changes, fix merge conflict, then commit and push.

#### Medium
* Create a repo on github and give your pair access to the repo
* Have them check out the repo locally. Make sure that they can commit to your repo.
* Following the easy example, create a file locally, push it to github.
* Edit that file on github, then edit the same line on both machines locally. Try to push both machines up to github and see an octopus merge.
* Create a branch, add some files, then push to github. Have your pair pull down that branch and push some changes.
* Merge this branch back into master and push to origin.
* Rebasing instead of merging:
* Have your pair change some files and push to github
* Instead of using `git pull` try `git fetch origin && git rebase origin/master`
* Look at the `git log` and figure out what's different.

#### Hard

* Pull requests:
  * Create a repo, do not give your pair access to the repo. Have them fork the repo, and push changes to that repo.
  * Have your pair make a pull request and accept it.
  * Do a code review and leave a comment on a line and on the commit.
  * Have your pair 'fix' the concerns in your comments and push. How does this show up in the history?
  * Finally, install `hub` and generate a pull request from the command line. ([https://github.com/defunkt/hub)](https://github.com/defunkt/hub))
* Rebase squash:
  * Make a series of commits in a branch, push to origin. Make sure your pair checks out and pulls down this branch locally.
  * Do a git log and select the sha before your first commit
  * Do a `git rebase -i <sha>`. 'pick' the first line, 'squash' all the others. Exit your editor and save.
  * Force push this new commit to github. (This will rewrite history breaking anyone else connected to your branch)
  * Have your pair try to pull down the changes, what goes wrong?
  * Have your pair `git fetch origin && git reset --hard origin/<branch-name>`. They need to blow away their local history before they can continue.

## Tuesday &mdash; 2/12/2013
### Topics
* HTML with Middleman

### Tours
* CrowdCompass

### Important Concepts
* Middleman
* html5shiv
* Code interpolation

### Important Threshold Concepts
* None

### Reading to do before class
* [http://diveintohtml5.info/semantics.html](http://diveintohtml5.info/semantics.html)
* [Treehouse: HTML Deep Dive: Objects, Tables, Forms](http://teamtreehouse.com/library/websites/html)
* [http://middlemanapp.com/getting-started/](http://middlemanapp.com/getting-started/)

### Resources
* [http://html5please.com](http://html5please.com)
* [http://code.google.com/p/html5shiv/](http://code.google.com/p/html5shiv/)
* [http://middlemanapp.com/templates/](http://middlemanapp.com/templates/)
* [http://middlemanapp.com/pretty-urls/](http://middlemanapp.com/pretty-urls/)
* [http://middlemanapp.com/advanced/rack-middleware/](http://middlemanapp.com/advanced/rack-middleware/)
* [http://middlemanapp.com/advanced/sitemap/](http://middlemanapp.com/advanced/sitemap/)

### Exercises
#### Easy
* Create a valid html5 document with correct doctype, html tag, favicon, and auto-discover rss tag.
* Use 5 of the new html5 elements. Fill them with hipster ipsum and placekittens
* Include the html5shiv or Modernizr
* Research 3 new sublime shortcuts that would make creating html easier

#### Medium
* Install middleman and convert your html5 page. Use a central layout file. (make sure to use the --rack option when creating your middleman folder)
* Start the middleman server and revel in LiveReload.
* Use an iterator in your markup to output FizzBuzz to a page

#### Hard
* Use TryStatic to allow us to use URLs without .html on the end
* Create an app on Heroku and deploy this code there (this is why we needed the --rack option earlier)
* Add in a syntax highlighter using Rack
* Research how to use the sitemap generator built into middleman

## Wednesday &mdash; 2/13/2013
### Topics
* CSS3

### Important Concepts
* Display styles & floats
* CSS3 styles
* Vendor prefixes
* Polyfills/fallbacks
* Grids

### Important Threshold Concepts
* Floats

### Reading to do before class
* [http://remysharp.com/2010/10/08/what-is-a-polyfill/](http://remysharp.com/2010/10/08/what-is-a-polyfill/)
* Finish CSS Deep Dive on Treehouse

### Resources
* [https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills)
* [https://github.com/Modernizr/Modernizr](https://github.com/Modernizr/Modernizr)

### Exercises
#### Easy
* Using the site from yesterday, set the content to 960px wide and center it.
* Add in 4 sections with 4 divs. Each div has a different color. Set each of these divs to a different display: block/inline/inline-block/none
* Add in 4 more of these sections. Make them all display block and play with `float: left`, `float: right`, and clearfix.
* Finally, add in 2 more of these sections and play with display absolute, display relative, and the top/left attributes.

#### Medium
* Add in a grid framework like 960.gs, frameless, or Bootstrap
* Once you have a grid, make your site look reasonable. Add in a top nav, a left nav, a couple sections, and change the colors so that we don't all have bootstrap blue websites!
* Add in some rounded corners and box shadows using proper vendor prefixes. Find one extra CSS3 element that you think is neat so we can share that.

#### Hard
* Add in modernizr and remove the html5shiv. Find an html5 api that isn't supported in one of your browsers and try to add it. You may have to run parallels.
* Experiment with pushState or add in a proper media element. How does the media element differ between browsers?

## Thursday &mdash; 2/13/2013
### Topics
* Ruby

### Tours
* Burnside Digital

### Important Concepts
* Different types of variables (constant, global, instance, local, class)
* Different types of methods (global, instance, class)
* Looping
* Blocks and creating functions that use them
* Lambdas

### Important Threshold Concepts
* Blocks and yielding

### Reading to do before class
* Treehouse: hashes, methods, blocks

### Resources
* [http://www.codecademy.com/tracks/ruby](http://www.codecademy.com/tracks/ruby)
* [http://www.codecademy.com/courses/ruby-beginner-en-XYcN1](http://www.codecademy.com/courses/ruby-beginner-en-XYcN1)
* [http://www.codecademy.com/courses/ruby-beginner-en-ET4bU](http://www.codecademy.com/courses/ruby-beginner-en-ET4bU)
* [http://www.codecademy.com/courses/ruby-beginner-en-L3ZCI](http://www.codecademy.com/courses/ruby-beginner-en-L3ZCI)

### Exercises
#### Easy
* Classes, variables, and methods:
  * Create an HQ9F class ([http://esolangs.org/wiki/HQ9_Plus)](http://esolangs.org/wiki/HQ9_Plus))
  * Outside the class create the method h.
  * Inside this class, create methods, \_99, and f.
  * h should simply print out "Hello World!" and quit
  * \_99 should take 1 variable, how many bottles of beer on the wall
  * f should take 3 arguments, min, max, and substitutions, and print out FizzBuzz.
* Examples of usage:
  * h # (this is a global function)
  * HQ9F._99(99) # (this is a class method)
  * win = HQ9F.new
  * win.f(1, 100, {3: 'Chunky', 7: 'Bacon', 17: 'HeartPCS'}) # (this is an instance method)

#### Medium

* Modules:
  * Add `each` to your HQ9F class and `include Enumerable`
  * The class should use an array internally as storage
  * Once `each` works, try using reject or map to look at the internal state of the array
* Lambdas:
  * Create a method on HQ9F called push_lambda that puts a lambda onto a stack.
  * Pop pulls it off of that stack and `call`s it.

#### Hard
* Add a q method to HQ9F which prints out the source code of the file. This is called a quine.
* See if you can do this without using IO.read to just read the source file. :)

## Friday &mdash; 2/14/2013
* Wrapping it all up
* Retrospective
* Code review
* 1-on-1’s / Catchup time
* Networking points report
* Go
* Teambuilding
