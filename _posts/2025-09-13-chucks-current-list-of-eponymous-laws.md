---
layout: post
categories: nuggets
title: Chuck's current list of eponymous laws
description: |
  A collection of eponymous laws that Chuck finds particularly useful and relevant. These are the ones that come up most often in conversations about software development, team dynamics, and organizational behavior.
tags: nuggets, laws, principles, software-development
---

## Summary

The current list of Chuck's laws looks like this:

*Chuck’s Zero’th Law* – Earnest Oversimplification
Inaccuracies due to oversimplification generally stem from a lack of understanding, not malice. Unless sales is involved; then they are always intentional.

*Chuck’s First Law* — Dimension Inadequacy
Any description of a complex system — such as human personality — that uses fewer than 7 axes is an oversimplification (see Chuck’s Rule of Earnest Oversimplification).

*Chuck’s Second Law* — Function Inadequacy
Any description of a complex system — like the economy or population trends — that uses a simple function like “average” is an oversimplification (see Chuck’s Rule of Earnest Oversimplification).

## The non-bite-sized version

In an effort to make complexity seem approachable, well-meaning people will often oversimplify systems — and in doing so, introduce additional, unintended (and often incorrect) complexity. People are not as dumb as some seem to think, and it is a disservice to oversimplify complex systems so far that they fit into a single headline.

Determining whether something is critically oversimplified can be challenging, so I propose these rules to help decide when further investigation is warranted.

### Chuck’s Zero’th Law – Earnest Oversimplification
> Inaccuracies due to oversimplification generally stem from a lack of understanding, not malice. Unless sales is involved; then they are always intentional.

Oversimplifications are not always bad, we just need to be careful with them.

### Chuck’s First Law — Dimensional Inadequacy
> Any description of a complex system — such as human personality or system health — that uses fewer than 7 axes is likely an oversimplification.

For instance, are you an introvert or an extrovert? That's one axis, so I would say that it's certainly an oversimplification. It's not enough to answer the question of whether to go out to a show tonight.

How about the error rate of a service? Is a 10% increase in errors enough to page me at 2am? Maybe, it's just not enough to answer the question.

#### Corollary - Decisions should be made based on multiple dimensions that corroborate each other

When you get in the next day, see if you can clone that alert and add some corroboration. Maybe you only focus only on errors for the pages with the 90th percentile most traffic. Then you make that one go off quickly, and the general case you only answer if it's been bad for 20 minutes instead of 10 minutes.

### Chuck’s Second Law — Functional Inadequacy
> Any description of a complex system — like the economy or system health — that uses a simple function like “average” is an oversimplification.

Talking about the average salary in your country is absolutely an oversimplification, and making policy based on that should never be done. I don't think that's terribly controversial.

Yet we _regularly_ make decisions about systems based on the average response time or the average number of users.

#### Corollary - Multiple percentiles are a much better option (Quartiles with outlier bars would be even better!)

When you make your charts, instead of averages, try doing the 50th, 95th, and 99th percentile. I don't have a great way to limit outliers, but at least getting percentiles gives you a much better view of reality.
