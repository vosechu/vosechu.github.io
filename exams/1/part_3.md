---
layout: page
---
# Utilities

***

{% include confidence.md %}
Q: When we have untracked files in our working directory, how do we prepare them for committing?

* A: `git add .`
* B: `git add -m`
* C: `git commit -am ""`
* D: `git stage .`

***

{% include confidence.md %}
Q: When we want to clone a repo from Github, which command should we use?

* A: `git clone origin vosechu/test`
* B: `git init git@github.com:vosechu/test.git`
* C: `git clone git@github.com:vosechu/test.git`
* D: `git checkout vosechu/test`

***

{% include confidence.md %}
Q: When we push files to Github and it throws an error saying it can't 'fast-forward', what do we do?

* A: `git push -f origin master`
* B: `git fast-forward master`
* C: `git pull origin master`
* D: `git fetch origin`

***

{% include confidence.md %}
Q: What is the standard Rack response?

* A: `[status, body]`
* B: `[status, headers, body]`
* C: `body`
* D: `{:status => 200, :headers => {}, :body => body}`

***

{% include confidence.md %}
Q: What is the status code for "I'm a teapot?"

* A: 701
* B: 302
* C: 404
* D: 418

***

{% include confidence.md %}
Q: When you need to get the current directory in Ruby, which of these work?

* A: `File.expand_path('.')`
* B: `Dir.pwd`
* C: `File.dirname(__FILE__)`
* D: All of the above

{% include confidence.md %}
Q: When regexing, how do I ask for just alphabetic characters?

* A: `alpha`
* B: `.*`
* C: `[a-zA-Z]`
* D: `\a+`

***

{% include confidence.md %}
Q: Which of these is a reasonable way to check for email addresses?

* A: `.*?@.*\..{2,4}`
* B: `::email::`
* C: `.*@.*`
* D: `?[^@]++.com`

***

{% include confidence.md %}
Q: How do you substitute a regex in Ruby?

* A: `"boomboomshaka".replace(/boom(.*)shaka/, 'love\1pumkins')`
* B: `"boomboomshaka".regex(/boom(.*)shaka/, 'love\1pumkins')`
* C: `"boomboomshaka".sreg(/boom(.*)shaka/, 'love\1pumkins')`
* D: `"boomboomshaka".gsub(/boom(.*)shaka/, 'love\1pumkins')`

***

### Short Answer

{% include confidence.md %}
Q: Why do we use Git instead of a file checkout service? Wouldn't that prevent merge conflicts?

A:
<p>&nbsp;</p>
<p>&nbsp;</p>

***

{% include confidence.md %}
Q: Why do we use Rack? It seems overly complicated and confusing to me.

A:
<p>&nbsp;</p>
<p>&nbsp;</p>

***

{% include confidence.md %}
Q: Why does every programmer seem to love Regexs?

A:
<p>&nbsp;</p>
<p>&nbsp;</p>
