---
layout: post
categories: nuggets
title: How to write onboarding docs for large organizations
description: This is the strategy I use to write docs for current practitioners, and how I help newcomers to the field gain the context they need to become current practitioners.
tags: nuggets
---

## Summary

![A graph of learning over time. The line slants up and to the right, then levels out. It's divided into two parts, the left says "videos, 1-1, etc. Everyone is different here". The one on the right says "Reference docs, source code, people's heads". The left side looks like swiss cheese; it has holes in it.](/images/posts/learning_chart.jpg)

Making educational content is really, really hard. Split the task into two parts:
1. Documentation for current practitioners and experts.
1. Documentation for newcomers who need the context to become a current practitioner.

My suggestion is to **start by writing the doc that _you_ will need in 6 months**. You know, after you've forgotten the little details, but you still have the overall context. Include things like how you tweak your port settings or that extra script that you don't have checked in or how you made your `.env` file. It will bitrot, but don't worry about it.

Only after getting that down, **then start on docs that provide newcomers enough context to read the other doc**.

Trying to make docs that do **both** requires tremendous skill. Normally what happens is that newcomers can't follow it, and current practitioners are annoyed by the simplifications.

There is no magic search engine that will allow newcomers to find the right docs; it requires some current practitioner to help them identify their gaps and point them towards docs (or maybe even to write the docs for the newcomer).

## The non-bite-sized version

You know that doc in your internal docs that has _all_ the information. It's the real one, the one you have referenced so often that your browser knows what you mean when you type the 'g' key in the url bar. Nah, it doesn't go to github, it goes to the reference docs for a file called `grandcentral.yml` (or whatever it is for your organization).

My guess is that file doesn't contain _any_ extraneous details. It's barely (or entirely) incomprehensible by newcomers, but my word it contains so much useful information if you know what you're looking for.

That doc requires that the reader has a healthy amount of context around the problem and it doesn't try to cater to anyone that doesn't have context. That's good, we want that, but it does pose a problem: how do we let newcomers enter the fray too?

So someone tries to refactor it and make it easier to read. They simplify it, put the new copy in a new location, and really put a lot of effort into it. But unfortunately, that doc is never read again, while the reference doc continues to receive plenty of traffic.

The problem is that newcomers need different formats, and are missing different things from their history.

### Current practitioners need different things than newcomers

![A graph of learning over time. The line slants up and to the right, then levels out. It's divided into two parts, the left says "videos, 1-1, etc. Everyone is different here". The one on the right says "Reference docs, source code, people's heads". The left side looks like swiss cheese; it has holes in it.](/images/posts/learning_chart.jpg)

This chart is how I think people learn. On the left is all the content needed to get people up to speed as current practitioners. On the right is all the knowledge you gain after you've become a practitioner. Current practitioners favor resources that are searchable, bookmarkable, or fixed in location. But newcomers will have different histories and backgrounds, they will have different problems. Many of them will hit the same _rough_ problems, but no one document will work for all newcomers in the same way that it _does_ work for current practitioners.

So we need to split the process into two parts. Get current practitioners the information they need, then get newcomers to the point where they can read those documents.

### What newcomers need

Newcomers will likely need 1-1 interactions to determine which gaps they have. There may still be docs that can be written, but it helps to have a real human say, "hey, I see you're hitting this problem, I wrote this doc about exactly that". We can't expect them to search the wiki and magically find just the right doc to help them onboard; they need help to find that doc. There is no search engine that can help them find just the right resources, or rather, there is, it's called a human.

So my recommendation is that we focus first on producing great reference docs for current practitioners. Then as we teach more people, we try to document the things that help our trainees feel comfortable and get over the hurdles. It's a little bit like the airplane "put your mask on first, then help others".

But make no mistake, failing to write onboarding docs will ensure that _you_ will be the only trainer. If you write docs, newcomers will help _other_ newcomers onboard; that is why we write newcomer docs. Not so they can be found by newcomers, but so that they can be referenced and linked to by people that you train!

### Conclusion

Current practitioners and newcomers need different things. Current practitioners need reference docs, but newcomers need all manner of different strategies, so they need a real human guide.

Write docs for current practitioners. Then teach enough people that you get a feeling for the common problems and start writing about those problems. People you train will then train other newcomers, and you can start in on a different domain.

But if you don't write docs for newcomers, you will be the trainer forever.

I hope this helps!
