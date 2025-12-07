---
date: 2025-12-07T01:02:26-08:00
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
const matchingSongs = songs.filter(song => song.lyrics && song.lyrics.toLowerCase().includes("blurry"));

for (const song of matchingSongs) {
    const lines = song.lyrics!.split('\n').filter(line => line.toLowerCase().includes("blurry"));
    console.log(`Song: ${song.title} by ${song.artist}`);
    console.log("Lines:");
    lines.forEach(line => console.log(line));
    console.log('---');
}
```
