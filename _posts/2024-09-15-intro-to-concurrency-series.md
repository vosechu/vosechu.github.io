---
layout: post
categories: tech
title: Intro to High-Scale Concurrency Limiting
description: This introduction makes the case for why you should be intrigued by this series, and interested in following along as I share what I learned implementing these tools at New Relic. I hope that you'll implement these methods in your organization as well!
tags: concurrency
---

## Introduction

This is my [third](/tech/2023/08/24/tuning-bulkheads-before-deploying-them-to-production.html) [attempt](/tech/2024/09/07/concurrency-why-it-matters.html) at this series and every time I feel like I'm failing to do it justice. It's too long, too muddled, too insufficient. This is important to me and I want to do it right.

So this time I'm going to take it slow and methodically. I'm going to take the time to explore and explain each of the topics, so that we can all arrive at the end together.

**But I promise it's worth it.** By using these techniques on our largest monolith, we were able to go from 3 pages a day to 1 page per month.

This is the rough order I'm going to take:
* [**(You are here) A case for "High-Scale Concurrency Monitoring and Limiting"**](/tech/2024/09/15/intro-to-concurrency-series.html)
* [What do I mean by "High-Scale Concurrency" and how does it differ from single-machine concurrency/parallelism](/tech/2024/09/15/what-is-high-scale-concurrency.html)
* Why would you want to monitor concurrency? Are there alerts that work especially well with this?
* What tools do we need in order to monitor concurrency? Are there different levels of monitoring?
* What is "Ingress Concurrency Monitoring"? And what additional facets would you recommend for those dimensional metrics?
* What is "Egress Concurrency Monitoring"? And what additional facets would you recommend for those dimensional metrics?
* Now that we have all this monitoring in place, what now?
* Implementing fixed ingress concurrency limits based on historical data, and the challenges and shortcomings to expect
* Implementing adaptive ingress concurrency limits (new challenges, new shortcomings)
* Implementing on-demand egress limits for specific cohorts of problematic users
* Implementing fixed egress concurrency limits (still based on historical data), and the challenges and shortcomings to expect
* Implementing adaptive egress concurrency limits (new challenges, new shortcomings)
* Implementing on-demand egress limits for services in trouble
* Conclusion - A pitch for a shift in the observability industry

## I want you to learn this because I care about your health and happiness

I got into observability because I wanted to help my friends exit the painful cycle of getting paged at night and then not being able to come to game night because they were exhausted (mostly altruistic, but I'll admit that there's some of my interests in there too). Unfortunately,
> I think the observability industry has lost it's way. We've become so fixed on hoovering up data that we forgot why we were here in the first place: to help.

I want you to not get paged anymore. That's it. That's why you're here, and that's why this series is here.

Probably you'll learn some cool shit along the way too. Hopefully, I'll challenge you on some assumptions you have about how concurrency works at scale and help you rethink those assumptions.

> But at the end of the day, I want you to not get paged anymore.

## Super quick background

My team and I did all this work in the following context:
* 1 mega-repo service built in Ruby on Rails over 15 years (who says Rails can't scale?)
  + This was the main UI experience for all customers
  + 200k-400k req/min throughout the day
  + 80-100 fairly beefy docker containers (8 CPU quota, 40GB RAM quota)
  + 30 external services, 1 bonkers timeseries database, 11 normal databases (MySQL), 5 redises
  + 25 processes per container (about 2000 unicorn processes total)
* 7 teams actively working on the monorepo
  + My team was responsible for reliability/scaling, developer experience, security, and the things that didn't fit anywhere else.
* 3 pages / day, most due to external services going down or just slowing down

Pretty dry, I know. But we have to start somewhere!

Soon we're going to roll this out to the entire company, so I'll have to write a series on that because it's going to be very different. But for now, let's move on to the [next article](/tech/2024/09/15/what-is-high-scale-concurrency.html).
