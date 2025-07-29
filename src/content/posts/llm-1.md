---
date: "2025-07-29"
title: "Lessons from vibe coding a major project [LLMs for code, part 1]"
categories: ["blog", "ai"]
description: ""
---

(This post still needs to be spell checked. I'm publishing it now to get the thoughts out of my head, but I'll come back and polish it later. And no, this post was unforunately not AI-generated lol)

I think this is a good analogy for how vibe coding falls apart at scale:

Let's say you're a premiere vibe coder. You've got all the tricks -- 200 AGENTS.md files, 50 Claude Code subagents, $200 a month for Opus 4, all that jazz. You want to make a to-do list app. It starts off simple -- each task can be red, yellow, or green. You know frontend and backend but are too lazy to write the code yourself, so you pick a tech stack -- React + Vite + Convex, which LLMs are particularly good at -- and vibe. Your codebase is maybe ~600 lines total initially and looks like this:
```
✅✅✅✅✅✅✅✅✅✅✅✅✅✅💩✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
```
It's overall beautiful, but snuggled into a mutation or schema somewhere is a bad design choice -- probably won't matter too much, especially when all of the code is beautiful! It's only five lines of code, you can just go back and audit/remove it later.

Time for your next feature, being able to have multiple lists. You continue vibing, adding a second layer to your app's code. It now looks like this:
```
✅✅✅✅✅✅✅✅✅✅✅✅✅💩💩💩✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
✅✅✅✅✅✅✅✅✅✅✅✅✅✅💩✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
```
Okay, since some parts now rely on the bad design choice so they also are a bit garbage. That's fine though -- it can't spread too much. Or can it?

10 big features later and your app looks like this:
```
✅✅✅✅✅✅✅💩💩💩💩💩💩💩💩💩💩💩💩💩💩💩✅✅💩💩💩💩💩💩💩💩💩💩💩💩💩💩💩✅✅✅✅
✅✅✅✅✅✅✅✅💩💩💩💩💩💩💩💩💩💩💩💩💩✅✅✅✅💩💩💩💩💩💩💩💩💩💩💩💩💩✅✅✅✅✅
✅✅✅✅✅✅✅✅✅💩💩💩💩💩💩💩💩💩💩💩✅✅✅✅✅💩💩💩✅✅💩💩💩💩💩💩💩✅✅✅✅✅✅
✅✅✅✅✅✅✅✅✅✅💩💩💩💩💩💩💩💩💩✅✅✅✅✅✅✅💩✅✅✅✅💩💩💩💩💩✅✅✅✅✅✅✅
✅✅✅✅✅✅✅✅✅✅✅💩💩💩💩💩💩💩✅✅✅✅✅✅✅✅✅✅✅✅✅✅💩💩💩✅✅✅✅✅✅✅✅
✅✅✅✅✅✅✅✅✅✅✅✅💩💩💩💩💩✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅💩✅✅✅✅✅✅✅✅✅
✅✅✅✅✅✅✅✅✅✅✅✅✅💩💩💩✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
✅✅✅✅✅✅✅✅✅✅✅✅✅✅💩✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
```
The garbage code now firmly sits in your codebase and even takes up a considerable chunk. Maybe you even wrote some of the green parts, but now the poop is so omnipresent you're scared to touch X, Y, and Z parts of your codebase. Even if you just want to change the type of animation in a microinteraction, you have no idea how to, and worry that asking Claude to do it will cause irreparable harm to the codebase.

What *should* happen right now is, given all of your learnings from using the vibe coded prototype, you completely rewrite the app. Maybe you use AI assistance (Claude Code), maybe you even copy some of the green parts from the old codebase. **But you actually look at and understand the code this time.** When you want to change the color of an element, or the length of an animation, you don't need to pray that Claude understands -- you intimately understand the codebase so you can find and tweak the Tailwind class.

What happened in *my* case is that we just kept on building. This ended up having a few side effects:
* Our entire frontend was vibe coded. Our backend was (purportedly) handwritten but I cannot verify that. We had a LOT of GEMINI.md files etc. (being broke students, we used Gemini CLI chiefly).
* Eventually, the frontend got to such a bad state that adding any features became painful. We could prompt away with Gemini, but it wouldn't get pretty far without running into an unsolvable bug or getting stuck with some mutation API.
* Half of our to-dos (for the app) at that point were just "Fix the UI." Most of them were crossed off and marked as "Impossible" after a team member realized what a dumpster fire the frontend was. We eventually came to a consensus that we needed a rewrite, but that is still under consideration.
* We began discussing drastic options, such as self-hosting our Convex database or rewriting our backend, because the AI-generated code literally was wasting away our credits. (seriously -- we had 20 users and somehow ate 800 megabytes of bandwidth in less than week.) Often, these were touted as a "good excuse to rewrite our terrible frontend."

A genuine text I sent to the team is:
> I keep on telling you, every time I try to touch the UI I get burnt so hard I want to quit doing frontend altogether

This is the story of a recent project that I contributed to, [Dotlist](https://github.com/edwrdq/dotlib). Dotlist is still undergoing development and I have faith that we'll figure out how to fix these mistakes. This isn't meant to roast or dunk on our choices -- instead, it's a cautionary tale for how to avoid them in the future.

<aside>I now use <a href="https://dotlist-lite.vercel.app/">Dotlist Lite</a> for managing all of my todos and haven't ran into a single issue yet. Features like live sync and the (in my opinion :D) beautiful themes make me truly enjoy the experience, even if it doesn't have some of the sparkly features of the regular Dotlist.</aside>

Eventually, you have to start fresh with a new codebase. This is what I did with [Dotlist Lite](https://github.com/aadishv/dotlist-lite). It's not meant to compete with Dotlist, and I'll probably only touch it sporadically from now on. I made it because I needed a good todo list app *now*, not when we figured out how to fix the UI of Dotlist. I specifically designed Lite to be much leaner while still supporting all of the important features, as well as much more polished microinteractions/UX. How I got this to happen while still using Claude for the most part is quite interesting:
* I set up the project myself. I wrote out the Convex Auth boilerplate, setup shadcn themes (using tweakcn to choose), and styled primitive elements myself. The content, database, mutations, and queries, however, were left empty.
* I made Claude port my old code to this codebase. I had an old version of Dotlist which I published as a tool on my website; it was a tiny React app which saved to localstorage. For the initial prompt, I just had Claude port the entire app (only ~600 LOC of TypeScript) to our new Convex + Vite foundation. The key idea of this is that I already understood the code, having worked on the old app for a while, so there is a very low chance of having any garbage code show up in the process. This already had the vast majority of features I needed.
* I tuned microinteractions myself. If I didn't like a font choice or animation speed, I looked at the Tailwind classes and changed them. This is important to build up knowledge of what goes where in the codebase.
* When I wanted to update a feature, I always asked Claude to do it. I'd review the code and test it out. If a specific part had a problem, I'd ask Claude to "simplify" and remove that part, then rewrite it myself.



If you're looking for a simple todo app, check out Dotlist! It is still a great choice even if it's vibe coded and the team is working hard to fix our issues with the AI-generated base.
