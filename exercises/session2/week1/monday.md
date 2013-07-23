---
layout: page
body_classes: exercise
title: Week 1 &mdash; Monday
---

### Morning warmup

* Tower activity to meet your table

### Daily announcements

* How was the weekend?
* Networking reportout / show & tell (who, title, company, relationship level)
* No lightning talks this week
* Who's working with which quint
* Topics for the week (from above)
* Networking events (from above)
* Weekly activities (from above)

### Lecture activities

* Mini-lecture
* Hand out performance metrics
* Paper-questions (re: sticking points)

### Lecture topic

* Class Introduction & Machine setup

### Lecture notes

    <!-- TODO: Refactor this list for clarity and timing -->
    What is a teacher?
      Not the sage on the mount anymore, that doesn't work
        Facilitator of learning and learning environments
      Not a curriculum creator
        Guide along the path of curriculum options
      Gradual release of responsibility
        1-4: I provide everything
        5-8: You start researching topics of my choosing
        <!-- TODO: Pair down learning plans to exactly 8 with many extras -->
        9-12: You decide what areas you want to focus on
    My sticking points
      Coming to class late (even 5 min)
      Leaving class early
      Laptops open during lecture (I promise to keep it short)
      Not doing the reading the night before
      Homework by Saturday at midnight
      Hiding in plain site (squawk early)
    In exchange I will
      Ensure that your reading assignments are done by Saturday
      Be flexible to alternative learning strategies
    What are your sticking points?
      <!-- TODO: Do we just raise hands? Do a handout? -->
    How we use the space
      Chores for the classroom
      Decoration
    Communications
      Chat rooms, hubot, mailing lists
      Team names
    Expectations about your peers
      The role of designers/ops in the class
      Partners responsible for each other
      Quints
      Peer teaching
    How to ask good questions
    <!-- TODO: Remove this section and make it a full topic -->
    How to pair
      Screensharing etiquette
      Strategies for working together
      Tri-pairing
    Introduce the activities
      <!-- TODO: Are we still doing book club? -->
      Book club
      Group reading night before H+H
      <!-- TODO: Are we doing LT checkins throughout the week? -->
      Lightning talks
      Affinity groups
      Friday meetup with Adv/Mentors
    Health
      3 o'clock walk
      Stretching
      Pomodoro
    Evaluation activities
      Weekly exams
      (n%3) 1-on-1s
      Retro
      Code review
    Family activities
      Lunch each day
        Family that eats together stays together
      Carpooling
      Friday beer bust
    Networking
      1 event per week mandatory
      <!-- TODO: Decide whether to do networking points on whether a show and tell might work better -->
      >30 points per week expected
      Introduce supercharges
      1-4: H+H mandatory. Bring nametag/hoodie.
      5-8: networking in small groups to understand the scene. H+H for extra help.
      9-12: network to find a host/mentor. H+H for extra help.
    Homework expectations
      Blog each week
      Lightning talk every 4 weeks
      Book club notes
      Nightly quizzes
      Github every day
    Project schedule
      Week 4: Portfolio
      Week 8: Projects
      Week 12: Open source / individual projects
    Advanced track
      <!-- TODO: Write out what I want to talk about here -->
    Weekly events
      Monday
        Announcements
      Tuesday
        Hack+Help
        (sometimes) Tour and Talk
      Weds
        Lightning talks
        Affinity groups
      Thursday
        (possibly) Mentor day
        (sometimes) Tour and Talk
      Friday
        (every week) Exams (1-2hr)
        (weeks 1,2,6,11) Retrospective
        (weeks 3,4,5,7,8,9,10) Code review
        (weeks n%3) 1-on-1
        Show and tell: exciting blog posts / tutorials / animated gifs
    Daily events calendars
    <!-- TODO: Fix these calendar links -->
    General schedule of the class
    <!-- TODO: Finish filling this out -->
      Week 1:
        **Ruby**
        Git, Pairing, Machine setup, Algorithm development, Troubleshooting, Shortcuts
      Week 2:
        **Ruby+Testing**
        Testing/TDD
      Week 3:
        **JS**
      Week 4:
        **JS+Testing**
      Week 5:
        **Rails**
      Week 6:
        **Rails**
      Week 7:
        **Rails**
      Week 8:
        **JS Patterns**
      Week 9:
      Week 10:
      Week 11:
      Week 12:

### Exercise activities

* Make-a-wiki (re: machine setup, each group picks one topic area)

### Exercise

* Work with your table to setup machines.
* Share your configuration settings with the table and the class via the Github wiki

Things to include in your setup:

* Xcode / CLI tools
* homebrew
* Sublime
* Sublime config
* heroku toolbelt
* Chrome
* adium + irc auto-login
* iTerm
* growl
* dropbox
* caffeine
* LiveReload?
* 1password?

Class choices:

* Natural scrolling?
* LiveReload via app or sublime?
* How to switch to QWERTY from Colemak/Dvorak/Workman
* Zsh or Bash? Oh-my-zsh?
* How to share credit for code created during pairing session? (hitch gem?)

Wiki articles:

* Migrating from Windows to mac
* Installing Ruby
* Installing, via homebrew, one of: mysql, postgres, nginx, ack
* Configuring Sublime
* Configuring Adium
* Configuring LiveReload
* Configuring Bash/ZSH + aliases
* Configuring screenshare / pairing setup
* Switching to 1password
* Configuring Git and $EDITOR

***

### Afternoon warmup

* Find 10 new shortcuts, write them out on 3x5s and practice at least 20 times each
* Practice typing
* Posture consultation from peers
* Work with your table to find a way to share shortcuts or flash cards

### Lecture activities

Research-and-share: Spend time with your pair finding answers to these topics. Share answers with the class over IRC as you find them.

### Lecture topic

* Git/Github

### Lecture notes

* What is a diff? What does it look like on Github?
* What is a merge conflict? What does it look like locally?
* What is a remote? Can you use Git without a remote?
* What makes a good username?
* Is the Github app an acceptable alternative for now? Why or why not?

### Exercise activities

* Discovery-process
* Exercise

### Exercise

Always with your pair. Do one laptop at a time.

Research-and-do:

* How to get Dropbox running and backing up code (yes it really needs to be Dropbox for now)
* (**Most important step**) Where are you going to keep your code for the rest of the class?
* How to get your SSH keys uploaded to Github.
* What are the two ways to make a repo on Github and use it locally?
* What is the normal process to get files up to Github?
* How to add a collaborator to your repo.
* How to merge changes from a collaborator.
* How to resolve a merge conflict? How can you simulate a merge conflict?
* How to set your $EDITOR variable so that it doesn't default to vi if you forget your `-m` flag

<!-- * Setup
  * Decide where you're going to keep your code for the rest of the class. It should be somewhere within Dropbox.
  * Generate an ssh key and upload it to your account on github. Test it out with `ssh -T git@github.com`
  * Add a repo on Github called git_test and check it out locally to your source directory
  * Create some text files with at least 3 lines in them.
  * Follow the normal git process above.
  * Edit the text files.
  * Follow the normal git process above.
  * Look at the commits tab on Github.com to see what a "diff" is.
  * High fives all around.

* Merging
  * Edit the text files on Github directly by clicking the file and clicking on Edit. Remember which line you edited.
  * In your local directory, edit some other line in the same file.
  * Try to follow the normal git process above. Github should complain about not being able to "fast-forward".
  * Do a `git pull origin master` to pull changes and then try pushing again.
  * High fives all around.

* Conflicting
  * Edit the text files on Github again.
  * In your local directory, edit the same line in the same file that you changed on Github.
  * Try to follow the normal git process above. Github should complain about not being able to "fast-forward".
  * Do a `git pull origin master` to pull changes. This time git will complain about a "conflict".
  * Use `git status` to figure out which files are conflicted or use Sublime to search for "<<<".
  * In a merge conflict Git presents both sides of the debate between "<<<<", "====", and ">>>>". Choose which lines you would like to keep, then delete the arrows and the equals signs.
  * Now follow the normal git process from above.
  * High fives all around.

* Setting your $EDITOR variable
  * Having to specify `-m "message"` to git all the time is annoying. Lets fix that.
  * Open a file called `.bashrc` in your home directory (~). If you've set up the `subl` command you can do this: `subl ~/.bashrc`
  * Somewhere in that file write `export EDITOR="subl -w"`. Save and quit.
  * In order for this to become active, either "source" the rc file in each tab of your terminal or just quit the terminal and reopen. To "source" a file do this: `. ~/.bashrc`.
  * Because `.` isn't very obvious most systems also allow you to type `source ~/.bashrc`. -->

### Helpful commands

{% highlight bash %}
# Push files to existing repo on Github
git add .
git commit -m "my commit message"
git push origin master

# After pushing to Github, deploy files to heroku
git push heroku master

# Clone a repo created on Github
# Copy the SSH link from github: git@github.com:username/repo_name.git
git clone git@github.com:username/repo_name.git

# Create a repo locally, push to Github
git init
git add .
git commit -m "initial commit"
# Copy the SSH link from github: git@github.com:username/repo_name.git
git remote add origin git@github.com:username/repo_name.git
git pull origin master # This pulls down the .gitignore and the README.md
git push origin master

# Create a new heroku repo and add the remote locally
heroku apps:create [subdomain]
{% endhighlight %}