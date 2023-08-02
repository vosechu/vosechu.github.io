---
layout: post
categories: tech
title: How does `docker build` even work?
tags: docker
---

> So yesterday we moved all of the non global `npm installs` from `Dockerfile.test` to the `test_suites` command section of the `grandcentral.yml`. Why was having all of those `npm installs` in `Docerfile.test` not resulting in the container having `node_modules`( not in root, server, or client…), but having those same commands in the `test_suites` does result in the `node_modules` being there? :ty-blob:

Great question, challenging answer. I'll do my best :)

When you do a `docker build` (or the first steps of `grandcentral shell`), what you're essentially doing is creating a folder. Docker calls this an "image", but don’t be deceived, it's a folder that gets zipped up.

The first thing you do in that folder is unpack a complete copy of ubuntu (or whatever). The whole thing is in that folder, but it’s not a running machine yet, just a folder full of shedloads of files.

Next you run some commands from the various Dockerfiles, but how does that work? There’s no running container yet right? I had to look this up. Apparently it boots an ephemeral container (let’s call it an “anonymous” container because it feels very similar to an anonymous JS function) using the FROM statement, runs the command, maybe changes that folder of files that we’ve been creating, then shuts down. I don’t know if docker does any kind of fanciness or if it literally boots a new container each time it runs a new command, but given the community’s love of putting everything on a single line, I could imagine that it really is booting a new container for each RUN or COPY or WHATEVER command it sees.

Now let's say our dockerfile looked something like this (don't do this, this is a bad idea): 
```
FROM ubuntu:20.04

RUN npm install -g eslint

WORKDIR /work/src/source.datanerd.us/EOPS/incident-manager
COPY . .
RUN npm install
```

When we get to `RUN npm install -g eslint`, docker boots the container using the `FROM` line, using the folder we’ve been working on as the root filesystem. Then npm looks up it’s path with something like `npm root -g` (which will be something like `/usr/local/lib/node_modules`) and downloads the eslint package into that folder. The `eslint` “binary” (AKA, shell command) will also be put in the folder `npm bin -g`, which is probably `/usr/local/bin`. That’s fortunate, because our `$PATH` is set by ubuntu to something like `/usr/local/bin:/usr/bin:/bin`, so those binaries will be put in a folder that’s already able to be found by our shell.

Now let's get to the regular `npm install`; that's where the fun really starts.

We set our `WORKDIR` to `/work/<whatever>`, so when we load a container it automatically `cd`s to that folder. Then we copy in the source code from our laptop to the working directory, then we run a command which takes a while. 

If you were to examine the filesystem at this point you would find a nice `node_modules` folder in the correct place. Everything went fine!

Okay, now let's load this container up with `grandcentral shell`. Just like normal, it boots a container using the `FROM` line, using the image folder we've been building as a file system. At this point, the `node_modules` folder is still in the working directory. But `grandcentral shell` has an option passed to it, `--volume /Users/chuck/ghe/incident-manager:/work/src/source.datanerd.us/EOPS/incident-manager:cached`, so docker dutifully creates a new filesystem at `/work/src/source.datanerd.us/EOPS/incident-manager`, which it's totally allowed to do, even though it's wild. So your `node_modules` folder *is there*, but it's hidden under a new filesystem that _doesn't_ have that `node_modules` folder (because we deleted the `node_modules` folder on your laptop filesystem). So it may as well not be there, because we have no way to access it. 

So, we have 3 options:
1. Install everything globally. This works because `/usr/local/lib/node_modules` doesn't get overwritten by a volume mount, so this would be fine. It's not even a particularly bad idea. 
	1. Installing everything globally means you lose the ability to have more than one `node_modules` folder. 
	2. The other downside is that every time you run `docker build`, this directory will get blown away.
2. Install things to `node_modules` only _after_ the volume is mounted (AKA, as a `command` in the GC.yml). This works, but it overwrites your `node_modules` folder on your laptop, which could cause some weirdness. 
3. Install things to a **sekret location**. Somewhere that is mounted *like* `/work`, so it'll be shared between image builds, but somewhere out of the way that doesn't change your laptop's `node_modules` folder. 
	1. That's what `.grand-central-build-dependencies-cache` is. It's on your laptop, so it'll be added when the volume is mounted, but on your laptop nobody would ever think to look in there and use that `node_modules` folder, so you don't have to worry about contamination. 
	2. Except, when I look through the docs, it sorta seems like this just isn't possible. https://github.com/npm/npm/issues/775. 
		1. So you could change the global root, [like this](https://source.datanerd.us/rdouglas/MaturityNerdletASA/blob/19ae7a5c127d1cf1a1ec08457e1194e97a14acc4/maturity-nerdlet/Dockerfile#L6) (and maybe also [some of this, but using `$HOME`](https://source.datanerd.us/docs-eng/docs-library-service/blob/5381fad01cf56a1849bff405065ca239d7db5baa/Dockerfile.local#L22)). That would allow this directory to be shared between builds, so you could move the `npm install -g` into the GC.yml which would mean the modules wouldn't have to be installed every time you run `grandcentral shell` (they would only run during the test, but in almost all cases they would find out that all the modules were already there and up to date! Huzzah!)
		2. But we still have the problem of only allowing one `node_modules` folder.

The third option feels like the right option for most teams, but it doesn't work for you. Most teams aren't going to do a lot of `grandcentral build` shenanigans locally, so it probably doesn't matter. You probably need to add a thing to your README that says: "If it works locally but not on GC Jenkins, blow away your node_modules folders and try again." and then call it a day. :)

So, the short answer is: 
They *are* there, but you can't have them. GC is being nice and overlaying them with your local laptop's source code. The globally installed libraries _aren't_ being overlayed, which is why they can stay in the Dockerfile.test. For the production build, nothing is mounted and we don't use `/work`, so there's no problems there; that's why the Dockerfile can have `npm install`, but for `test_suites` it needs to be in the GC.yml. 
