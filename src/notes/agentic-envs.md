I've recently been slowly ramping up my use of agents. The last time I tried to use agentic coding, it [spun into a mess of vibed coding](/llm-1), so I tried my best to avoid it this time. I'd previously been using the "fast iteration" models, notably Grok Code Fast 1 and sometimes OpenCode's Big Pickle (which is GLM-4.6), to do smaller tasks like

* Refactor this function to use this helper.
* Write another function in the style of this one, with the following changes.
* Move this logic out of the function into a separate module.

As I tried to do larger refactors or add functionality, though, this quickly reached its limit. This was partially due to model choice; I switched to using Claude Opus 4.5 for big tasks. However, an equally big issue was the agentic environment in which the model ran. 

Agentic models, like basically all coding-oriented LLMs today, rely on some kind of feedback loop to generate correct code; it's practically the definition of "agents." In both OpenCode and Zed, LSP support is built-in, so, for example, ESLint automatically checks changed files and reports its errors back to Claude. This doesn't work perfectly sometimes, though.

In a recent large-scale refactor, the model changed the schema and indexes for a commonly used table in the database, which is used by basically all of the backend. ESLint wasn't running on those files though, so the built-in LSP didn't return any errors. I thus instructed the model to run `bun typecheck` (which force-runs eslint on all files, not a subset) to find everywhere where its changes broke stuff. The typecheck command itself took around 20 seconds but eventually, after many iterations, the model did manage to get the full refactor done. Notably, even though it took several minutes, it required no input from me -- I didn't have to test the backend myself, or even rerun typecheck, because..

The typecheck was all the model needed. In all of my projects, typesafety is the #1 goal[^typesafety], not only because it makes it much easier to test code, but also because agentic work significantly simpler. The agent didn't have to spin up 3 MCPs, run the Next dev server in the background, and then manually check all flows. The typesafety provided by the tools and services we used meant everything fell into place on its own.

Having some kind of "end-to-end" testing system is great in a lot of cases, since it enables the model to practice test-driven development, or at least use tests directly to check its code, providing an extra layer of safety over typechecking. Here's an example of a recent project where I provided exact examples of input and output and let the model figured out the rest: [OpenCode transcript](https://opencode.ai/s/UkNhmA7i). In this case, I didn't even review the model outputs because I could verify that it passed the tests, showing how such clarity is helpful even when vibe coding.

However, there are systems where tests aren't easy or trivial or fast to add, like in my initial example of a Next.js app with dozens of possible user flows. In those cases, typesafety is the best bet, and one you should make sure pervades everywhere.

TL;DR: Add end-to-end testing/encourage TDD where you can; otherwise, type safety and typechecking are musts.

[^typesafety]: In a recent small playground I've been working on, I'm basically just writing a Python wrapper around string manipulation: particularly, I'm using Python typechecking to create an extremely safe LaTeX creation system. The use of strict types means I can avoid footguns easily; you can't add a polygon to an expression in Desmos, and neither can you in my Python LaTeX wrapper; you can't return a boolean in functions, and neither can you there; etc. **Typesafety is good for humans *and* agents.**
