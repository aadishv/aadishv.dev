---
date: "0001-01-01"
title: "Notes, shower thoughts, ramblings, etc."
hidden: true
---

made gemini do some back-of-the-napkin math

tl;dr google has a AI code editor called antigravity which provides access to a bunch of models. Pro users for $20/month get really high rate limits on models with a 5 hour refresh window

I fed in the rate limits in and asked it to calculate the worst-case possible request for each model -- e.g. the one that has the longest input, longest output etc. then multiply that by the corresponding rate limit. then sum across all models.

I got that google will pay $4,266.23 every 5 hours if you perfectly abuse their rate limits. This is over half a million dollars per month. However, this was calculated using API pricing. Google is serving the models itself on Google Cloud so it doesn't need to pay the margins (lol). Assuming they a 50% margin (which they probably have a lower margin), Google pays $311,641.70 per month of inference costs for the worst case user. This user still pays $20/month.

Obviously this is nothing but a thought experiment as actually getting this level of usage is practically impossible, but this is a good proof that AI companies are extremely heavily subsidizing access to frontier models, to the benefit of their customers.

I'm sure even I have spent more than $20 of inference on antigravity so far even though I haven't used it much

double checked the numbers by running the same prompt again w/ gemini 3 pro & 3 flash thinking and got the same result, so I'm pretty sure its not hallucinating.

[link to chat](https://gemini.google.com/share/484f3a99c6f9)

---

**Some random babbling about terminal coding agents**

I've recently gotten more into terminal coding agents such as Anthropic's Claude Code, OpenAI's Codex CLI, and Google's Gemini CLI. Until a few days ago, I primarily had used OpenCode (and a bit of the Gemini CLI), which uses "alt-mode" rendering where it basically creates a whole new viewport in order to run the TUI. This allows for less flickering but prevents native terminal features such as "regular" scrolling and copy/paste etc.

I recently got access to an Antigravity subscription[^no-antigravity-sub-young] which gives access (with relatively good rate limits) to Claude Opus/Sonnet, gpt-oss, and Gemini 3 models at no additional cost to me. (The pattern is that they only provide models which they can serve thru Google Cloud, which is why Claude but not GPT models are available.) OpenCode already has a [plugin](https://github.com/shekohex/opencode-google-antigravity-auth/tree/main/src) for using Antigravity models, and there are several other open source implementations of its APIs.

It is also around this time that I got into [Pi](https://shittycodingagent.ai/), an ultra-minimal and extremely opinionated terminal coding agent. It operates using terminal scrollback like Claude Code. I quickly fell in love with its minimal UI yet powerful functionality. The willful omission of MCP, sandboxing, subagents, plan mode, todos, background tasks, etc. etc. also made it very easy to get started with and use. I eventually made my own (tiny, lol) [contribution](https://github.com/badlogic/pi-mono/pull/234) to fix a small QoL issue. I also used a tool called [`ccs` (Claude Code Switcher)](https://github.com/kaitranntt/ccs) which allowed me to use my Antigravity and Copilot subs in Claude Code. I thus gave Claude Code a shot for the first time in my life.

I'm overall pretty happy with all three of these coding agents. Pi's creator, Mario Zechner, provides a good explanation of how Pi's philosophy differs from Claude Code in his rationale for making it:

> Over the past few months, Claude Code has turned into a spaceship with 80% of functionality I have no use for. The system prompt and tools also change on every release, which breaks my workflows and changes model behavior.

Interestingly for me, the lack of advanced Claude Code features actually made it just lightweight enough for me. Since I was using it through non-official methods, features like background bash and subagents just didn't exist. This basically made Claude Code slightly more bloated than Pi. I still am amazed at its sandboxing and the ability to automatically detect what folders a bash command touches. And Claude's interface is my favorite by far.

On a whim, I decided to try implementing Antigravity auth for Pi, since it existed already for Claude Code and OpenCode. I used Claude Code (via `css`) with Claude Opus 4.5 through Antigravity. This was my first major interaction with Claude Code and Opus, and I was blown away. I basically gave it a few reference repositories for implementing Antigravity OAuth and also the Pi repo (for context about how to configure Pi), and it managed to write a minimal CLI that did exactly what I wanted. I made a [post](https://x.com/aadishvdotdev/status/2002236472162988469) about it, and Mario quickly [integrated it](https://x.com/badlogicgames/status/2002310455436390673) into Pi itself. The magic of open source!

I think if I was to summarize my experience with the coding agents:

- OpenCode is a beast and not to be underestimated. The massive community and extremely extensible nature allows for leaps like [Oh My Opencode](https://github.com/code-yeongyu/oh-my-opencode). The UI is a bit information-dense for my taste though and I don't think I prefer alt mode. I like thinking about OpenCode/alt-mode TUIs as a "GUI in the terminal", versus the regular CLI's that Claude Code and Pi (scrollback) implement. It's also very unopinionated which is great for the extensibility angle but makes setting up the agent a bit more tedious or at least confusing. TL;DR: most extensible, unopinionated but that's not a bad thing, I don't like alt mode
- Pi is the underdog, incredibly tiny but still powerful. The minimalness is overwhelming attracting and the UI is super intuitive. Using scrollback allows it to be faster on my aging laptop and feel a tiny bit more native, and also have cool goodies like native image rendering. Also pretty extensible, but I don't think as much as OpenCode. TL;DR: extremely opinionated but extensible, scrollback CLI is nice, massive potential
- Claude Code was the first real TUI coding agent and somehow still the biggest closed-source one. I love its look and feel but don't have many other praises to sing. It's also neither as unopinionated/extensible as OpenCode, nor as minimal/opinionated as Pi, putting it in an awkward middle ground. TL;DR: closed source -> Bad™, doesn't have the benefits of Pi or OpenCode, but I really love the look

[Mario](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/) and [Peter Steinberger](https://steipete.me/posts/2025/signature-flicker) both have interesting takes into the alt mode vs. scrollback debate, both of which I found very helpful as well.

I hope to continue contributing to OpenCode and Pi in the future. Both seem very promising as the future of agentic coding!

[^no-antigravity-sub-young]: I didn't have one previously because, even though I am in a Google One family with Google AI Pro, Google arbitrarily decided that people under the age 18 can't access half of their coolest AI products. Luckily I'm now using the "burner" account of a family member so I can get all of the perks of AI Pro.

---

I recently commented on [this Hacker News post](https://news.ycombinator.com/item?id=45916196) about a new Zed blog post:

> There is a lot of complaints about Zed in the comments here. I don't think that they are "hate", per se; they all definitely care about Zed and want it to succeed.
>
> I daily drive Zed for work across several languages and I love it. I use a lot of its features, like the git interface, agentic editing, etc. I might even consider paying for Pro in the future if I want unlimited edit predictions.
>
> However, all of these complaints are fully justified. I think Zed is a massive undertaking, only one that a VC-backed company has the capital to do. iirc, it requires 70k lines of Rust just for the cloud part [1]. I cannot fathom the amount of fundamental infrastructure they have to get the editor functional at all. That doesn't excuse all of the papercuts in Zed though.
>
> If I were Zed I would do the following:
>
> 1. stop all work on future features, like DeltaDB etc. They all seem extremely cool but they won't meaningfully contribute to increasing Zed adoption or fixing its issues.
> 2. remove all agentic editing features. if Zed tries to simultaneously become the world's best agentic editor and a good general-purpose text editor, it will fail at both. Keep around ACP so users can still use other agents, but remove all of Zed's built in agent stuff.
> 3. fix literally every papercut. Triage every single issue and go through every PR, even if it will take half a year to do so. People won't switch to Zed until it's perfect, and the existence of this many issues means it's not perfect enough.
> 4. make extensions actually good. Every programming language, library, etc. has it's own ecosystem, and many such ecosystems mainly rely on VSCode extensions for advanced features. Zed needs to be extremely extensible like VSCode is; obviously its architecture makes this slightly harder, as it's nontrivial, for example, for extensions to render their own GUI, but there are a lot of low(er)-hanging fruit for extensions that need to get solved. People will only switch to Zed if they can get a similar breadth of ecosystems.
>
> Of course, this won't happen, and given that none of these will really make them money, Zed has no incentive to focus on these, especially given the amount of time they would need to do this. But I think that if Zed can't nail the core experience, it won't get anywhere.
>
> [1] https://maxdeviant.com/posts/2025/head-in-the-zed-cloud/

---

A few months ago, towards the end of summer break, I spent some time working on a tool to save and analyze song lyrics. I called it [Lyrix](https://github.com/aadishv/lyrix). I stopped work on it halfway through a massive [refactor](https://github.com/aadishv/lyrix/pull/3) after realizing it would take forever to create a good response comments UI. I never ended up actually implementing the cool analysis features I had planned other than commenting on song lyrics. I still used the commenting feature quite a bit though; here are [the comments](https://lyrix-eight.vercel.app/song?id=24004028&shared=037e80) I made for City Walls immediately after Breach released, for example.

I recently came back to it because I wanted to do some song analysis of my own, but just didn't have the tools to do it. However, a lot has changed since then in how I listen to my music; notably, I've switched mostly from YouTube Music to a local (free) Apple Music instance. An advantage of this is that all of my songs are just .mp3 files with some metadata, including their lyrics and other stuff. This enables really easy lyrics manipulation; for example, [here's a short script](/automation/#update-92325-adding-lyrics) I wrote to automatically find and add lyrics.

I decided to use this and create a minimal AI "scaffold" to enable it to analyze song lyrics. The overall shape I was planning was 1) a tiny TypeScript module which exported methods to get songs and read lyrics, and 2) a Markdown file of rules for the agent for how to use the code to run analysis. The idea of "rules+scripts" immediately brought to mind [Claude skills](https://simonwillison.net/2025/Oct/16/claude-skills/); turns out that OpenCode has a very similar implementation for [custom agents](https://opencode.ai/docs/agents), where I could just put a Markdown file of rules in a directory for OpenCode to detect. I wrote the tiny script (<25 lines!) and asked Gemini to generate the rules given some pointers. I selected OpenCode's Grok Code Fast 1 model since it was, well, fast, pretty smart, and free to use for all users.

[the script I used (`~/Music/Music/analysis/getSongs.ts`)](https://gist.github.com/aadishv/a53c864877aa619b02d0c32790922b33)

It worked perfectly! After tuning the agent a bit to tell it exactly how to use the OpenCode tools for editing files, it could easily write TypeScript code to find certain words in the lyrics, return the verses of matches, etc.

Here's an [example](https://opencode.ai/s/6UmRP2Yu); it wrote this code for the query `List all songs that contain "blurry", and tell me the full line(s) on which the word occurs`:

```ts
import { getSongs } from "./getSongs";

const songs = getSongs();
const matchingSongs = songs.filter(
  (song) => song.lyrics && song.lyrics.toLowerCase().includes("blurry"),
);

for (const song of matchingSongs) {
  const lines = song
    .lyrics!.split("\n")
    .filter((line) => line.toLowerCase().includes("blurry"));
  console.log(`Song: ${song.title} by ${song.artist}`);
  console.log("Lines:");
  lines.forEach((line) => console.log(line));
  console.log("---");
}
```

---

One of the key things I pushed in my recent post about developing agentic environments was having some way to test basic functionality for your app, whether it's a suite of unit tests or just a type checking terminal command. [Theo](https://t3.gg/) (of YouTube and TypeScript fame) agrees with me, and conveys a similar point in his recent video about how to best using AI for coding! Here's the part of the video where he discusses the importance of such a testing strategy for an effective feedback loop: [link to timestamp](https://youtu.be/-g1yKRo5XtY?t=2854).

I've seen really good results using this method, some of which have made me rethink my views about agentic coding in general; more on that soon.

---

I've recently been slowly ramping up my use of agents. The last time I tried to use agentic coding, it [spun into a mess of vibed coding](/llm-1), so I tried my best to avoid it this time. I'd previously been using the "fast iteration" models, notably Grok Code Fast 1 and sometimes OpenCode's Big Pickle (which is GLM-4.6), to do smaller tasks like

- Refactor this function to use this helper.
- Write another function in the style of this one, with the following changes.
- Move this logic out of the function into a separate module.

As I tried to do larger refactors or add functionality, though, this quickly reached its limit. This was partially due to model choice; I switched to using Claude Opus 4.5 for big tasks. However, an equally big issue was the agentic environment in which the model ran.

Agentic models, like basically all coding-oriented LLMs today, rely on some kind of feedback loop to generate correct code; it's practically the definition of "agents." In both OpenCode and Zed, LSP support is built-in, so, for example, ESLint automatically checks changed files and reports its errors back to Claude. This doesn't work perfectly sometimes, though.

In a recent large-scale refactor, the model changed the schema and indexes for a commonly used table in the database, which is used by basically all of the backend. ESLint wasn't running on those files though, so the built-in LSP didn't return any errors. I thus instructed the model to run `bun typecheck` (which force-runs eslint on all files, not a subset) to find everywhere where its changes broke stuff. The typecheck command itself took around 20 seconds but eventually, after many iterations, the model did manage to get the full refactor done. Notably, even though it took several minutes, it required no input from me -- I didn't have to test the backend myself, or even rerun typecheck, because..

The typecheck was all the model needed. In all of my projects, typesafety is the #1 goal[^typesafety], not only because it makes it much easier to test code, but also because agentic work significantly simpler. The agent didn't have to spin up 3 MCPs, run the Next dev server in the background, and then manually check all flows. The typesafety provided by the tools and services we used meant everything fell into place on its own.

Having some kind of "end-to-end" testing system is great in a lot of cases, since it enables the model to practice test-driven development, or at least use tests directly to check its code, providing an extra layer of safety over typechecking. Here's an example of a recent project where I provided exact examples of input and output and let the model figured out the rest: [OpenCode transcript](https://opencode.ai/s/UkNhmA7i). In this case, I didn't even review the model outputs because I could verify that it passed the tests, showing how such clarity is helpful even when vibe coding.

However, there are systems where tests aren't easy or trivial or fast to add, like in my initial example of a Next.js app with dozens of possible user flows. In those cases, typesafety is the best bet, and one you should make sure pervades everywhere.

TL;DR: Add end-to-end testing/encourage TDD where you can; otherwise, type safety and typechecking are musts.

[^typesafety]: In a recent small playground I've been working on, I'm basically just writing a Python wrapper around string manipulation: particularly, I'm using Python typechecking to create an extremely safe LaTeX creation system. The use of strict types means I can avoid footguns easily; you can't add a polygon to an expression in Desmos, and neither can you in my Python LaTeX wrapper; you can't return a boolean in functions, and neither can you there; etc. **Typesafety is good for humans _and_ agents.**

---

I've recently been using the idea of **vibeability** to decide whether or not to pursue specific ideas or tasks. It goes something like this: _could an AI agent complete this task within a reasonable timeframe?_ If so, then it's vibeable!

The specifics of the agent aren't really important. I generally go with the defaults I use, which is gpt-5-mini or grok-code-fast-1 (gpt-5-codex for hard problems) with the Zed agent. I don't use custom rules, AGENTS.md, or any of that, simply because I don't use agents heavily enough for it to be worth it to do. Of course, if you have the perfect agent setup, with a state-of-the-art model, a [Ralph Wiggum loop](https://ghuntley.com/ralph/), and a perfectly tuned system prompt, a good agent can do crazy things -- give it a few months and [it will make a programming language](https://cursed-lang.org/). But I don't care much about that.

For example, the vibeability of [this PR to Venice](https://github.com/venice-v5/venice/pull/6) is extremely vibeable. It basically entails reimplementing the vexide devices SDK as a Micropython package, which is easy to do given the high-quality examples already present in Venice. Thus, I actually wrote the majority of this PR with Grok Code, of course reviewing its outputs. I could just paste in a function signature, give it a few hints, and it would do very well at implementing the corresponding API definition. This hints at the First Rule of Vibeability: **tedious tasks are vibeable.**

I think this also explains why I don't really want to become a full-time web dev (a.k.a. [soydev](https://www.urbandictionary.com/define.php?term=Soydev)). I did web programming, particularly with React and Convex, for most of the summer. There were parts that were really fun, like designing the architectures and solving hard problems about processing data. But the actual frontend work, i.e., writing the UI, was not much more than repeatedly writing out boilerplate and tuning Tailwind classes. It wasn't tedious, per se, and it would be wrong to cast all frontend work as being easy to automate. There are plenty of hard problems to solve even on the frontend! But I do think that frontend would quickly bore me after some time, so I'll label it has vibeable.

Now take [Venice](https://venice.fibn.cc/), the repo whose PR I used as an earlier example. Venice is most definitely not vibeable. Imagine you pulled out Claude Code and asked it to

- write Micropython bindings from the C codebase to Rust,
- write a bootloader, linkerscript, and host of other insane things for the linked program to run on the armv7a-vex-v5 rustc target,
- implement the full VEX SDK in a type safe Python API,
- write a CLI which wraps serial communications with the brain for building and uploading programs,
- and publish it to PyPI.

It would choke on the first step. Yet this is only a fraction of the work we need to make Venice a usable Python runtime for the brain. This, and many other examples, lead me to the Second Rule of Vibeability: **interesting tasks are not vibeable.** I can hear you screaming "gpt-5-codex can solve plenty of interesting tasks!" and yes, it can, but when I envision an interesting task, I don't just mean a task that involves writing or testing code. I mean one that involves doing hours of research, designing an architecture, iterating on prototypes, and polishing the final product. Software is truly art; saying that AI has already replaced coders is akin to saying that the art industry has been replaced by Etch-A-Sketches. I have a bit more to say on how agents aren't great yet at interesting tasks, but that's for another note.

TL;DR: if a task is vibeable in your opinion, either don't do it, or just make an agent do it.
