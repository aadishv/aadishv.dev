---
date: 2025-11-28T14:57:39-08:00
--- 
I just commented on [this Hacker News post](https://news.ycombinator.com/item?id=45916196) about a new Zed blog post:

> There is a lot of complaints about Zed in the comments here. I don't think that they are "hate", per se; they all definitely care about Zed and want it to succeed.
> 
> I daily drive Zed for work across several languages and I love it. I use a lot of its features, like the git interface, agentic editing, etc. I might even consider paying for Pro in the future if I want unlimited edit predictions.
> 
> However, all of these complaints are fully justified. I think Zed is a massive undertaking, only one that a VC-backed company has the capital to do. iirc, it requires 70k lines of Rust just for the cloud part [1]. I cannot fathom the amount of fundamental infrastructure they have to get the editor functional at all. That doesn't excuse all of the papercuts in Zed though.
> 
> If I were Zed I would do the following:
> 
> 1. stop all work on future features, like DeltaDB etc. They all seem extremely cool but they won't meaningfully contribute to increasing Zed adoption or fixing its issues.
> 
> 2. remove all agentic editing features. if Zed tries to simultaneously become the world's best agentic editor and a good general-purpose text editor, it will fail at both. Keep around ACP so users can still use other agents, but remove all of Zed's built in agent stuff.
> 
> 3. fix literally every papercut. Triage every single issue and go through every PR, even if it will take half a year to do so. People won't switch to Zed until it's perfect, and the existence of this many issues means it's not perfect enough.
> 
> 4. make extensions actually good. Every programming language, library, etc. has it's own ecosystem, and many such ecosystems mainly rely on VSCode extensions for advanced features. Zed needs to be extremely extensible like VSCode is; obviously its architecture makes this slightly harder, as it's nontrivial, for example, for extensions to render their own GUI, but there are a lot of low(er)-hanging fruit for extensions that need to get solved. People will only switch to Zed if they can get a similar breadth of ecosystems.
> 
> Of course, this won't happen, and given that none of these will really make them money, Zed has no incentive to focus on these, especially given the amount of time they would need to do this. But I think that if Zed can't nail the core experience, it won't get anywhere.
> 
> [1] https://maxdeviant.com/posts/2025/head-in-the-zed-cloud/
