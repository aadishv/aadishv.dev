---
date: "2025-01-31"

title: "Christmas Cards"

description: "Making animated Christmas cards for my family"

readMore: true
---

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
/* Animations */
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
/* Stars */
#background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 150vh;
  pointer-events: none;
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

![Stars background animation](/assets/christmas-cards/stars1.gif)

### Personalization

This card would be pretty boring if it was the exact same for each person. In order to customize it for each family member dynamically withouth having to create entirely new code for each of them, I have a `people` constant in my script which stores information about each person.

```js
const people = {
  /// [... many other family members ...]
  DA: {
    name: "Daddy",
    colors: ["#7a1c34", "#6e011d"],
    emojis: ["💻", "🧑‍💻", "☕", "🚗", "🔊"],
    awards: [
      "World's Best Dad",
      "World's Best Money Saver",
      "World's Best Hot Chocolate Maker",
    ],
    font: "Fragment Mono",
  },
};
```

Each person has an associated name (of course), colors (to form a gradient text color when I show their names), font (also to style their names), relevant emojis, and a list of "awards" (which we'll find a use for soon). The object itself is stored as a dictionary where each person is assigned a unique "person code" (e.g. my dad, who will be the test subject today, has the code "DA").

The person code of the person whose card will be shown is encoded as a URL parameter, e.g. https://aadishv.github.io/christmas/?p=MA. Let's use some basic JS to capture the parameter and update CSS values.

```js
const myperson = new URLSearchParams(window.location.search).get("p");
const people = {
  /* [...] */
};
const person = people[myperson.toUpperCase()];
const personalize = () => {
  document.documentElement.style.setProperty(
    "--gradient",
    `linear-gradient(90deg, ${person.colors[0]} 0%, white 50%, ${person.colors[1]} 100%)`,
  );
  document.documentElement.style.setProperty(
    "--font",
    `"${person.font}", sans-serif`,
  );
};
if (person !== null) personalize();
```

All of the other properties of our person need not be used by CSS and thus can just be referenced directly in other JS code.

Let's also set some suitable defaults, and while we're at it, might as well set a default font for non-personalized stuff:

```css
/* Import the personalized font */
@import url("https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&family=Lobster&display=swap");

/* General Styles */
* {
  font-family:
    "Helvetica Neue", HelveticaNeue, "TeX Gyre Heros", TeXGyreHeros, FreeSans,
    "Nimbus Sans L", "Liberation Sans", Arimo, Helvetica, Arial, sans-serif;
}

:root {
  --gradient: linear-gradient(90deg, lightblue 0%, white 50%, lightblue 100%);
  --font: sans-serif;
}
```

There we go, personalization done!

### Holiday greeting

I'd like the card to introduce a bit of cheer by saying, "Happy Christmas, [name]!" As noted above, I'd like the name to be personalized with a color gradient and font (I'm only using two fonts: one for the cursive-loving, and one for the programming type).

Let's start by updating the HTML to add a div to store the actual page content, and do basic styling.

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
        <span class="name"></span>
      </h1>
    </div>
  </body>
</html>
```

Notice that the name is empty. We'll be fixing that in a little bit.

Now for the CSS!

```css
/* Animation */
@keyframes typing {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
/* Greetings */
#content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  width: 100vw;
}

.greeting {
  position: fixed;
  color: white;
  font-size: 10vw;
}

.name {
  overflow: hidden;
  display: block;
  animation: typing 2s forwards;
  font-family: var(--font);
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 12vw;
}
```

This also adds a simple writing effect with a shimmer (sort of). It's very simple - we just slowly widen the span with the name in it from 0 to 100%, ensuring that the text overflows. We also add white in the middle of each person's gradient so that, as the text widens, the white area will move to the right, creating the shimmer.

Finally, let's ensure that the span tag containing the name doesn't end up empty. Let's fill it in the `personalize` function:

```js
const personalize = () => {
  // [...]
  document.querySelector(".name").innerHTML = person.name;
};
```

That looks awesome!

![Final card greeting](/assets/christmas-cards/name2.gif)
