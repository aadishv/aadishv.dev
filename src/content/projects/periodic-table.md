---
date: '2025-03-15'
title: 'Periodic Table'
description: 'A modern, interactive periodic table with detailed element information designed for chemistry students'
link: "/tools/periodic"
---
## Demo

<a href="/tools/periodic">Open this in a new tab to play around with</a>
<iframe src="/tools/periodic" class="w-[56rem] h-[42rem] my-auto mx-auto mt-2"></iframe>


This started off as a simple project to try out web technologies, Tailwind CSS, and JS best practices by porting a small SwiftUI app I'd made -- and to fulfill my dire need for an actually well-designed periodic table. It eventually grew quite a bit, with many more features than initially imagined and several of my classmates at OHS using it.

## Features

- (Obviously) all 118 elements
- Colorful elements based on the scheme of the [Google Arts Experiments periodic table](https://artsexperiments.withgoogle.com/periodic-table/)
- Click on an element to see a bunch of cool details about it:
  - Electron configuration (abbreviated)
  - Full electron configuration
  - Group
  - Atomic mass
  - Electronegativity (Pauling)
  - Oxidation states
  - Oxidation states (extended)
  - Fun fact
- _Super_-helpful formula mass calculator for any compound (and by "super helpful" I mean it; I've been asked to disable this during exams should students misuse it!)
  - Quick link to search the element on Google
- Fuzzy search that lets it read your mind and know you meant to type "praseodymium" instead of "preasdfdtyuhguim"
- A reference tab full of helpful images to have in a chem class

## Tech stack

- My website stack (coming soon!)
- Data collected using a custom scraper script combining data from the Google periodic table, a GitHub repository, and the Pearson periodic table


## [Code!](https://github.com/aadishv/aadishv.github.io/blob/main/src/tools/periodic)

This went through around four major iterations:

* The initial one was just a SwiftUI app that I had only ever built for myself. It was <200 LOC (lines of code)
