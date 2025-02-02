+++
date = '2025-01-31T10:56:02-08:00'
draft = true
title = 'Christmas Cards'
description = 'Making animated Christmas cards for my family'
tags = ["programming", "javascript", "html", "css"]
+++
## Introduction

Over the recent holiday season, I decided that gifts were not in vogue anymore, and that virtual gifts would be cheaper, easier to make, and less useful!

[spoiler: they were a nightmare. do not try this at home.]

## Overall
This is what the overall project ended up looking lie
```
├── assets
│     └── [...]
├── card.html
├── script.js
└── style.css
```
The final website also had an `index.html` file, but that was just a mirror of `card.html` to make the QR code stuff easier.

## Anatomy of an animated Christmas card [and overview of the coding process]

### Stars

As any winter-themed card does, this card will have twinkling stars in the background. This is not supposed to be super fancy or anything, so I'll just have a small orange square (with a shadow) that fades in and out and changes position between opacity cycles.

This project is mainly just an exercise in learning to code in Javascript a bit more efficiently, so I'll use objects to structure the stars.

```js
const newStar = (i) => {
  return {
    id: i,
    time: 1000 * Math.random() * 2 + 1000,
    init: function () {
      const x = Math.random();
      setTimeout(() => {
        var element = document.createElement("div");
        element.id = `star${this.id}`;
        element.className = "star";
        element.style.animation = `twinkle ${this.time}ms infinite`;
        document.getElementById("background").appendChild(element);
        this.updateTimeout(x);
      }, x * 1000);
    },
    updateTimeout: function (x) {
      console.log(`updating star ${this.id}`);
      var element = document.getElementById(`star${this.id}`);
      element.style.left = `${x * 100}vw`;
      element.style.top = `${Math.random() * 200}vh`;
      setTimeout(() => this.updateTimeout(x), this.time);
    },
  };
};
```
Each star has an `id` value, which is used to identify the DOM element to update in the animation, and a `time` value, which represents the length of the opacity cycle (which is different for each star). Notice that each star is initialized at a time that increases with its initial x-value, so that the stars will initially fade in from left to right. Every refresh of the opacity cycle, the only thing changed is the element's position (which we use `element.style.left` and `element.style.top` to do).

The stars are initialized in a div of the website's body:
```html
<!doctype html>
<html lang="en">
    <!-- [...] -->
    <body>
        <div id="background"></div>
        <!-- [...] -->
    </body>
</html>
```

Now let's do some basic styling.
```css
/* To add contrast for the stars, and a holiday feel */
body {
    background: linear-gradient(to left top, #432052, #0e1036) fixed;
}
/* To make a tall background (will be used later) */
#background {
    top: 0;
    left: 0;
    width: 100vw;
    height: 150vh;
    pointer-events: none;
}
/* star styles */
@keyframes twinkle {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

.star {
    position: absolute;
    width: 0.5vw;
    height: 0.5vw;
    background-color: orange;
    border-radius: 20%;
    box-shadow: 0 0 10px orange;
}
```

And, finally, to spawn in the stars:
```js
const spawnStars = (n) => {
  Array.from({ length: n }, (_, i) => newStar(i).init());
};
spawnStars(300);
```

There we go!

![Stars background animation](/stars1.gif)

### Holiday greeting

I'd like the card to introduce a bit of cheer by saying, "Happy Christmas, [name]!" Furthermore, I'd like the name to be personalized with a color gradient and font (I'm only using two fonts: one for the cursive-loving, and one for the programming type). In order to do this personalization, I have a variable in my JavaScript file which contains the name, colors, and font of each person, correspending to a "code" I assign to each person (this code will come in later). I'll be adding more fields to each person later.
```js
const people = {
  // [... many other family members ...]
  MA: {
    name: "Mommy",
    colors: ["#7a1c34", "#6e011d"],
    font: "Lobster",
  },
  DA: {
    checked: false,
    name: "Daddy",
    colors: ["#7a1c34", "#6e011d"],
    font: "Fragment Mono",
  }
};
```

Finally, I'd love each person's name to come in with a writing sort of effect.

Let's start with the basic name. I'll update the HTML to add a div to store the actual page content, and do basic styling.
```html
<!doctype html>
<html lang="en">
    <head>
        <!-- [...] -->
    </head>
    <body>
        <div id="background"></div>
        <div id="content">
            <h1 class="greeting">
                Merry Christmas,
                <span class="name"> Aadish </span>
            </h1>
        </div>
    </body>
</html>

```
Notice that the name is hard-coded. We'll be fixing that in a little bit.

Now for the CSS!

```css
/* Important fonts and do basic styling for the page */
@import url("https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&family=Lobster&display=swap");

* {
    font-family: "Helvetica Neue", HelveticaNeue, "TeX Gyre Heros",
        TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Arimo,
        Helvetica, Arial, sans-serif;
}


/* [...] */

/* Now for the actual greeting */
#content {
    /* To center children horizontally */
    display: flex;
    justify-content: center;
}

.greeting {
    padding: 10px;
    color: white;
    font-size: 10vw;
}

.name {
    overflow: hidden;
    display: block;

    /* The next few lines will eventually be dynamically personalized */
    font-family: "Fragment Mono", monospace;
    background: linear-gradient(90deg, #4da5f3 0%, white 50%, #4da5f3 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```
Looks good so far:
![Initial name code result](/name1.png)

Now let's get the writing effect working. It will be pretty simple. We'll just increase the width from 0 to 100% over 2 seconds (the overflow will be hidden thanks to the previous CSS). I'll also change the gradient a bit by putting white in between the two values - as the width expands, the white color will move to the right, giving it a shimmering effect.

```css
/* [...] */
@keyframes typing {
    from {
        width: 0%;
    }
    to {
        width: 100%;
    }
}

.name {
    /* [...] */
    animation: typing 2s forwards;
    /* [...] */
}
```
Now we get a beautiful animation.
![Final card greeting](/name2.gif)

### Personalization

The person code of the person whose card will be shown is encoded as a URL parameter, e.g. https://aadishv.github.io/christmas/card.html?p=MA. Let's use some basic JavaScript to capture the parameter and update CSS values.
```js
const myperson = new URLSearchParams(window.location.search).get("p") || "PB";
const people = {/* [...] */};
const person = people[myperson.toUpperCase()];
const updateCssValues = () => {
  document.documentElement.style.setProperty(
    "--gradient",
    `linear-gradient(90deg, ${person.colors[0]} 0%, white 50%, ${person.colors[1]} 100%)`,
  );
  document.documentElement.style.setProperty(
    "--font",
    `"${person.font}", sans-serif`,
  );
};
if (person !== null) updateCssValues();
```

And update the CSS accordingly:
```css
.name {
    /* [...] */
    font-family: var(--font);
    background: var(--gradient);
    /* [...] */
}
```

Now we can have personalization. The `updateCssValues` function and `people` constant will continue to change as we add more features.
