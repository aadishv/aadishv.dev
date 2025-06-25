---
date: "2025-06-24"
title: "DishPy: better Python development for VEX V5"
categories: ["blog"]
description: ""
---
## Prelude

As you [probably](/robotics-1) [know](/robotics-3), I am quite involved with the VEX robotics community. In fact, I have 4-5 more upcoming blog posts queued up just about robotics (not even including this one)!

After the VEX AI World Championships in early of this June (blog post coming soon!), I sat down and wrote a small Python CLI I call **DishPy** to make Python development on the VEX V5 more bearable (I'll explain why I made it below). Following is a post I planned to publish to the VEX Forums about DishPy. It was unfortunately unlisted by a VEX employee, likely because of its use of an internal binary (known as `vexcom`) that VEX uses to handle serial communication with the V5 brain. (I do not mention `vexcom` in the announcement, nor do I violate its license by distributing it.)

DishPy is now feature-complete -- I do not plan to add major functionality at this time. **This does not mean it is unmaintained** -- I am always available on the VEX VTOW Discord server to debug and will monitor issues on the repository, and will continue contributing for bugfixes and patch updates. However, I do hope to eventually deprecate DishPy, as it is a quite janky solution that relies on the VEX Micropython VM. One possible contender to replace DishPy in the near future, which I am also contributing to, is [Venice](https://github.com/Venice-V5/), an independent Micropython port. (To be clear, I am not the main contributor to Venice!)

[The original post in full](https://www.vexforum.com/t/dishpy-better-python-development-for-vex-v5/138077/2) follows below.

## Original post

Hi VEX community!

I’m Aadish, a coder on V5RC team 315P and VEX AI team 3151A. I recently became interested in Python development on the brain for a few reasons.

1. As part of 3151A, I developed a software stack to run on our coprocessor (a Jetson Nano). This involved fetching camera frames, running our custom model on them, doing post-processing efficiently on the GPU, and developing an efficient communications protocol to talk with the V5 brain. All of our coprocessor code (which spans over 2000 lines of code) is written in Python. However, our V5 code was entirely C++ in PROS, fracturing our codebase into two parts (not to mention our custom dashboard written in TypeScript 😬).
2. A member of 3151A, who goes by Chroma, came from a V5RC team, 3332A, he ran with his sister. All of 3332A’s code is Python, yet he was still able to do a lot of crazy stuff with it, such as a relatively consistent 50-point skills route. When I was the lead coder on 315P, we had also initially used Python, but switched to PROS for Over Under worlds and High Stakes because of the wealth of available libraries.

Despite this, using Python in V5RC is generally not considered a great idea. There are a few reasons for this.

1. **Multi-file support.** Unlike VEXcode C++ or PROS, VEXcode’s Micropython implementation does not support having multiple files. This significantly decreases code organization and makes it hard to navigate Python code. Chroma’s Python code, for example, was a single, 3000-line file.
2. **Libraries.** Because of the lack of multiple files, it is impossible to have good libraries in Python. The best thing you can get is copying-and-pasting thousands of lines of code into your program, which is obviously not ideal.
3. **Editors.** If you want to use Python to write VEX code, you are restricted to writing code in VEXcode or VSCode, as VEX does not offer extensions for other editors or a universal CLI.

I decided to fix all three of these in one fell swoop with a new project I have been working on for a few weeks, **DishPy.** (Yes, it is a pun on my name!)

* DishPy adds multi-file support by ~~using dark magic~~ messing around with the AST of your code to combine everything into one file.
* It has a simple package model inspired by PROS, with decentralized packages maintaining metadata and DishPy users having a local registry of packages on their computers.
* DishPy also has a simple CLI (also written in Python!) that allows you to build and upload DishPy projects from any editor (or, if you are a vim lover, from the terminal).
* The best part is that DishPy **just works.** Create a new DishPy project and paste in your current Python code — you can immediately start building and uploading it! Unlike PROS or vexide, which implement their own kernel, DishPy binds to the same Micropython VM as VEXcode Python does, so you can continue using the same APIs as you are used to.  We also auto-generate [docs](https://aadishv.github.io/dishpy/VEX%20SDK/) for the API for easy reference.
* It is all OSS and on my GitHub.

I hope you’ll try out DishPy and maybe even open an issue if you find one (or ping me on VTOW)!

**Quick links**

* Install from PyPI — https://pypi.org/project/dishpy/
* Github repo — https://github.com/aadishv/dishpy
* Docs — https://aadishv.github.io/dishpy/
  * Tutorial for beginners — https://aadishv.github.io/dishpy/Tutorial/1_installation/

Thanks,
Aadish (315P V5RC; 3151A VAIRC)
