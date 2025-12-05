---
date: 2025-11-21T14:57:26-08:00
---
I've recently been using the idea of **vibeability** to decide whether or not to pursue specific ideas or tasks. It goes something like this: *could an AI agent complete this task within a reasonable timeframe?* If so, then it's vibeable!

The specifics of the agent aren't really important. I generally go with the defaults I use, which is gpt-5-mini or grok-code-fast-1 (gpt-5-codex for hard problems) with the Zed agent. I don't use custom rules, AGENTS.md, or any of that, simply because I don't use agents heavily enough for it to be worth it to do. Of course, if you have the perfect agent setup, with a state-of-the-art model, a [Ralph Wiggum loop](https://ghuntley.com/ralph/), and a perfectly tuned system prompt, a good agent can do crazy things -- give it a few months and [it will make a programming language](https://cursed-lang.org/). But I don't care much about that.

For example, the vibeability of [this PR to Venice](https://github.com/venice-v5/venice/pull/6) is extremely vibeable. It basically entails reimplementing the vexide devices SDK as a Micropython package, which is easy to do given the high-quality examples already present in Venice. Thus, I actually wrote the majority of this PR with Grok Code, of course reviewing its outputs. I could just paste in a function signature, give it a few hints, and it would do very well at implementing the corresponding API definition. This hints at the First Rule of Vibeability: **tedious tasks are vibeable.**

I think this also explains why I don't really want to become a full-time web dev (a.k.a. [soydev](https://www.urbandictionary.com/define.php?term=Soydev)). I did web programming, particularly with React and Convex, for most of the summer. There were parts that were really fun, like designing the architectures and solving hard problems about processing data. But the actual frontend work, i.e., writing the UI, was not much more than repeatedly writing out boilerplate and tuning Tailwind classes. It wasn't tedious, per se, and it would be wrong to cast all frontend work as being easy to automate. There are plenty of hard problems to solve even on the frontend! But I do think that frontend would quickly bore me after some time, so I'll label it has vibeable.

Now take [Venice](https://venice.fibn.cc/), the repo whose PR I used as an earlier example. Venice is most definitely not vibeable. Imagine you pulled out Claude Code and asked it to
* write Micropython bindings from the C codebase to Rust,
* write a bootloader, linkerscript, and host of other insane things for the linked program to run on the armv7a-vex-v5 rustc target,
* implement the full VEX SDK in a type safe Python API,
* write a CLI which wraps serial communications with the brain for building and uploading programs,
* and publish it to PyPI.

It would choke on the first step. Yet this is only a fraction of the work we need to make Venice a usable Python runtime for the brain. This, and many other examples, lead me to the Second Rule of Vibeability: **interesting tasks are not vibeable.** I can hear you screaming "gpt-5-codex can solve plenty of interesting tasks!" and yes, it can, but when I envision an interesting task, I don't just mean a task that involves writing or testing code. I mean one that involves doing hours of research, designing an architecture, iterating on prototypes, and polishing the final product. Software is truly art; saying that AI has already replaced coders is akin to saying that the art industry has been replaced by Etch-A-Sketches. I have a bit more to say on how agents aren't great yet at interesting tasks, but that's for another note.

TL;DR: if a task is vibeable in your opinion, either don't do it, or just make an agent do it.
