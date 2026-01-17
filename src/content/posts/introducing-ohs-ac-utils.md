---
date: "2025-10-10"
title: "Introducing OHS AC Utilities"
link: "https://chromewebstore.google.com/detail/ohs-ac-utilities/mcnjeemajaoopeejjbfiieaepibmbjne"
---

<table style="margin-left: auto; margin-right: auto">
    <tr>
        <th colspan="3" style="text-align: center">Introducing</th>
    </tr>
    <tr>
        <th><h2>OHS</h2></th>
        <th><h2>AC</h2></th>
        <th><h2>Utilities</h2></th>
    </tr>
    <tr>
        <td style="text-align: center">
            <img
                alt="AC logo"
                src="/ohs-ac-intro.md/2.png"
                style="height: 3rem; width: 3rem;"
            />
        </td>
        <td style="text-align: center">
            <img
                alt="OHS logo"
                src="/ohs-ac-intro.md/1.png"
                style="height: 3rem; width: 3rem"
            />
        </td>
        <td style="text-align: center">
            <img
                alt="Chrome logo"
                src="/ohs-ac-intro.md/3.png"
                style="height: 3rem; width: 3rem;"
            />
        </td>
    </tr>
</table>
<style>
    th,
    td {
        border-color: transparent !important;
    }
</style>

_Hi, I'm Aadish. I'm a freshman here at Stanford Online High School._

I'm excited to show you a new tool I've been working on for OHS students. It's called OHS Adobe Connect Utilities (OHS AC Utils for short), and I've built it from the ground up to improve students' experience when accessing class recordings.

Many students have tried to download Adobe Connect recordings in the past. It's a widespread problem; for example, when I was flying home from homecoming last year, I wanted to download lecture recordings for all of the sections that I missed. I ended up spending half an hour of reverse-engineering to figure out how. That's when I got the original idea to make an Chrome extension that automates this complex process.

Let's look at a example. Let's open a random lecture, from, say, my biology class. Maybe I want to download it to review it later, or maybe I want to save it so I can still access it after the school year ends. Previously, I would have to fiddle around in the Chrome DevTools to figure out how the video is requested via the network. Now, I can just open the extension and download it with a single button click.

<video src="/ohs-ac-intro.md/ohs-ac-demo.mp4" style="width: 100%" controls></video>

Another issue that came up for me was that finding information inside a lecture is tedious. It's very much a needle in a haystack problem; it's basically impossible to find that one sentence out of a 70-minute recording! This inspired me to add an AI assistant to OHS AC Utils, powered by the state-of-the-art Google Gemini models, completely free, and with access to a wealth of information about the lecture.

Here's a simple example of using the AI assistant, based on the lecture transcript, to ask about a math topic we covered in class:

![AI Assistant](/ohs-ac-intro.md/SCR-20250904-tzxm.png)

The AI assistant goes much further than that, though! It is able to view the lecture image at any timestamp, enabling unparalleled access to the lecture context.

Here's a lecture I had for my English class a week or two ago. My professor mentioned that there is a Canvas page with some presentation tips. A classmate posted it in the chat but I can't select it from the recording, and I don't want to manually type out the full URL. With OHS AC Utilities, it's just a matter of asking the assistant to look at the timestamp and copy out the address for me:

<video src="/ohs-ac-intro.md/ohs-ac-live-demo.mp4" style="width: 100%" controls></video>

_Sorry that the video is so heavily edited. I had to be extra careful to avoid leaking footage of my classmates without their consent!_

It's truly magical. Another fun example I did recently was asking the assistant to find pictures of my teacher's dogs in biology class -- I was sure that my teacher had a slide with the pictures, but I had no idea where they were. The assistant carefully checked frames every 30 seconds, and after a few minutes of searching, it had successfully hunted down the frame with the pictures. I can't show a demo here due to privacy concerns, unfortunately.

If you have privacy concerns, the extension is [a fully open source project, built in TypeScript with WXT](https://github.com/aadishv/ohs-ac-utils), so feel free to go through the source code to make sure I don't steal your data :P

Download the extension today. I hope you love using OHS AC Utils as much as I do, and please consider leaving a review on the Chrome Web Store if you do!

- [Web Store link](https://chromewebstore.google.com/detail/ohs-ac-utilities/mcnjeemajaoopeejjbfiieaepibmbjne)
- [Privacy Policy](https://aadishv.github.io/ohs-ac-privacy)
