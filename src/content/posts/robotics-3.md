---
date: "2025-05-13"
title: "Robotics 3: 3151A"
---
This is the third part of what will eventually be a four- or five-part series. This third part is about my time on 3151A for the High Stakes season. I will be writing at least one more part about this and probably two more as there is just so much stuff to go over.

Here are the previous posts:
* [Robotics 1: 315P (Over Under)](/robotics-1)
* [Robotics 2: 315P (High Stakes)](/robotics-2)

## Background
After leaving 315P (see Robotics 2, linked above), I began volunteering at robotics competitions in NorCal. All of these were hosted at the [India Community Center](https://www.indiacc.org/) in Milpitas and sponsored by Paradigm. For reference, here’s a quote from Robotics 1 about what Paradigm exactly is:

> Paradigm is an organization of teams in Northern California; all Paradigm teams have team numbers that start with 315. Member teams of Paradigm help out, practice with, and provide parts to one another.

Paradigm also does a *lot* of community outreach, from hosting these competitions to the [Girl Powered](https://www.indiacc.org/girl-powered-robotics/) robotics workshops. As for the competitions I went to, they were the following:
* NorCal Signature. This was a signature event (that is, one meant to closely resemble the Worlds experience) with teams from around the world participating. I volunteered for the high school segments of this one.
* Region 2 Championships. California is (obviously) a large state, so it is further provisioned by VEX into multiple “regions”. Each region has its own set of championships (which are colloquially referred to as “states”), and Region 2 is smack-dab in the middle of Silicon Valley/the Bay Area. Many of the top teams in the world are from Region 2. In fact, a World Champion this year for high school, [80001B Double Play](https://www.robotevents.com/teams/V5RC/80001B), is from Region 2 as well. This makes states (as well as the NorCal signature) *insanely* competitive. I volunteered at both the middle school and high school regional championships.

At the middle school championships, I was approached by a coach of another Paradigm high school team (315A). 315A unfortunately hadn’t qualified to the world championships, but the coach proposed that, given the remaining time in the season, we form a VEX AI team.

Time for a detour.
## What is VEX AI?
VEX AI is roughly two “abstractions” away from the VEX V5 Robotics Competition.
### V5RC
Let’s start off with how the original (V5RC) is played.
#### General game<!-- {"fold":true} -->
Putting the following in quote blocks since it’s mostly review:
> V5RC is a game with two alliances (red and blue). Each alliance is composed of two V5RC teams, each of which brings to the field 1 robot made with VEX parts (a few external parts, such as plastic and string, are also permitted).
> Each game begins with a 15 second autonomous period, where robots move on their own without external input based on a preprogrammed routine. During the autonomous period, the robots of either alliance must stay on their sides of the field. This is followed by a 1 minute and 45 second driver control period, where robots are controlled by their drivers.
> There are multiple opportunities to score points in V5RC games. Whichever alliance scores more points during the autonomous period gains an autonomous bonus, which is worth a certain amount of points. There is also the chance to win an Autonomous Win Point in that period, which doesn’t affect the match outcome but helps to improve a team’s ranking in the greater competition.

All of the above is pretty generic and true of every V5RC game.
#### High Stakes<!-- {"fold":true} -->
Specifically, for the High Stakes game, there are a few ways to score points:
There are *rings* in High Stakes, of each alliance color:





<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



You can score rings on *stakes*, which are basically sticks with a rubber thing on top. The easiest stake to score on (and the one that is generally most focused on) are *mobile goals* (often referred to as “mogos”):





<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



Here’s what a mogo looks like with some rings scored on it:





<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



You can also score rings on *neutral wall stakes*:






<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



And on *alliance wall stakes*:





<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



As the name suggests, only one alliance can score on their alliance wall stake, and they can only score their color rings. (There is one alliance wall stake for each alliance, of course).
Every ring scored on a stake counts for points, and the top ring scored on a stake has a point bonus.
You can also hang your robot off of the *ladder*:





<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



Basically, the higher you hang, the more points you get.
There is also the concept of *corners*. If you put a mobile goal inside a *negative corner*, its rings’ values are essentially negated, subtracting points from their alliance’s other rings. (And no, a negative score is not possible!)





<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



If you put a mobile goal inside a *positive* corner, its rings’ values are doubled.




<p class="text-red-500">THERE SHOULD BE AN IMAGE HERE</p>



There are two positive corners and two negative corners.
As noted above, you can complete a certain set of tasks to get an Autonomous Win Point, but that’s not super important. To level the playing field, corner modifiers and hangs are not counted for the autonomous bonus (at least in V5RC — more on that later).
In the last 30 seconds, positive corners are protected — that is, robots can’t interact with goals in those corners. This is to encourage hanging.

That’s basically all of V5RC.
#### Common strategy<!-- {"fold":true} -->
The team 11101B basically pioneered this strategy at one of the very first competitions of the season and it hasn’t changed much since.
* Have a full goal in one of the positive corners, and have one of your alliance’s robots constantly guarding the goal.
* The second robot basically whizzes around the field, trying to steal the opponent’s goals and put them in the negative corner, or scoring on neutral wall stakes & other mogos. (Most autonomous programs already score on the alliance wall stakes.)
* In the last 30 seconds (when the positive corners become protected), the first robot can leave and also participate in gameplay, before both robots hang.
There have been massive strides in the hardware used to do these things, which are very interesting in their own right, but that’s a subject for a whole other blog post. If you want to check out some example robots, just search “vex high stakes robot reveal” on YouTube. This core strategy, however, has stayed invariant across much of the season (in my opinion).
### VEX U
