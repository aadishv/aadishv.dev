// Person data
const persons = {
  PB: {
    checked: true,
    name: 'Prakhar Bhai',
    colors: ['#4DA5F3', '#065FAE'],
    emojis: Array.from('📱🎮💻🧑‍💻'),
    awards: [
      "World's Best Java Coder",
      "World's Best Gamer",
      "World's Most Independent Man",
    ],
    font: 'Fragment Mono',
  },
  PD: {
    checked: true,
    name: 'Priyanshi Didi',
    colors: ['#BE88EC', '#7E53E6'],
    emojis: Array.from('🎨💃👗👛👠'),
    awards: [
      "World's Best Indian Dancer",
      "World's Best Tennis Player",
      "World's Coolest Vegetarian",
    ],
    font: 'Lobster',
  },
  MG: {
    checked: true,
    name: 'Mausagi',
    colors: ['#03D92D', '#01881C'],
    emojis: Array.from('✈️🥐🍴🍽️😋'),
    awards: [
      "World's Best Meta Employee",
      "World's Most Enthusiastic Traveler",
      "World's Best Uncle",
    ],
    font: 'Fragment Mono',
  },
  RM: {
    checked: true,
    name: 'Rupal Mausi',
    colors: ['#4DA5F3', '#065FAE'],
    emojis: Array.from('✈️🥐🍴🍽️😋'),
    awards: [
      "World's Most Spicy Cook",
      "World's Best Auntie",
      'Most Hardcore Food Enthusiast',
    ],
    font: 'Lobster',
  },
  MM: {
    checked: true,
    name: 'Minnie Mausi',
    colors: ['#7a1c34', '#6e011d'],
    emojis: Array.from('👗👛👠🪞'),
    awards: [
      // TODO
      "World's Best Auntie",
      "World's Best Phone Partner",
      "World's Most Photogenic Person",
    ],
    font: 'Lobster',
  },
  SM: {
    checked: true,
    name: 'Sunil Mausa',
    colors: ['#4DA5F3', '#065FAE'],
    emojis: Array.from('🎂🎈💻🧑‍💻🎁'),
    awards: [
      "Owner of the World's Coolest Birthday",
      "World's Best Macy's Employee",
      "World's Most Hospitable Man",
    ],
    font: 'Fragment Mono',
  },
  MA: {
    // TODO: photos
    checked: true,
    name: 'Mommy',
    colors: ['#7a1c34', '#6e011d'],
    emojis: Array.from('🧑‍🍳☕🤶♈♋♌♍'),
    awards: [
      "World's Best Chai Maker",
      "World's Best Stay-at-Home Mother",
      "World's Best Homeschool Parent",
    ],
    font: 'Lobster',
  },
  DA: {
    // TODO: photos
    checked: false,
    name: 'Daddy',
    colors: ['#7a1c34', '#6e011d'],
    emojis: Array.from('💻🧑‍💻☕🚗🔊'),
    awards: [
      "World's Best Dad",
      "World's Best Money Saver",
      "World's Best Hot Chocolate Maker",
    ],
    font: 'Fragment Mono',
  },
};

const myperson = new URLSearchParams(window.location.search).get('p') || 'PB';
const person = persons[myperson];

var nnn = 0;
const bdaytoxmas = () => {
  nnn += 1;
  if (nnn % 2 == 0) {
    document.querySelector('#holiday').innerHTML = 'Merry Christmas, ';
  } else {
    document.querySelector('#holiday').innerHTML = 'Happy Birthday, ';
  }
  setTimeout(bdaytoxmas, 1000);
};
if (myperson == 'SM') {
  bdaytoxmas();
}

document.documentElement.style.setProperty('--name-font', person.font);

//

class Snowflake extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    const randomTransform = () => {
      const x = Math.floor(Math.random() * 100);
      const rotate = Math.random() * 720 - 360;
      const rotate3d = Math.random() * 180 - 90;
      return `translateX(${x}vw) rotate(${rotate}deg) rotate3d(1,1,1, ${rotate3d}deg)`;
    };

    this.shadowRoot.innerHTML = `


      <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');

      @keyframes snowflake-fall {
          0% {
              transform: translateY(-10vh) ${randomTransform()};
          }
          100% {
              transform: translateY(110vh) ${randomTransform()};
          }
      }

      div {
        font-size: 2rem;
        position: absolute;
        opacity: calc(100vh - var(--scroll) * 1px);
        animation: snowflake-fall 10s linear infinite;
        font: "Noto Color Emoji";
      }
      img {
        width: 5rem;
        height: 5rem;
        position: absolute;
      }
      span {
        top: 0.75rem;
        left: 1rem;
        font-size: 3rem;
        position: absolute;
      }
      </style>
      <div>
      <img src="assets/snowflake.png"></img>
      <span>${person.emojis[Math.floor(Math.random() * person.emojis.length)]}</span>
      </div>
    `;
  }
}
customElements.define('snowflake-element', Snowflake);

// other stuff

document.title = `Merry Christmas ${person.name}!`;

// Set gradient colors
document.documentElement.style.setProperty('--gradient-1', person.colors[0]);
document.documentElement.style.setProperty('--gradient-2', person.colors[1]);

// Typing animation
const nextTypingStage = (i) => {
  document.querySelector('#name').innerHTML = person.name.slice(0, i);
  const wait = person.name[i] === ' ' ? 0 : 100;
  if (i < person.name.length) {
    setTimeout(() => nextTypingStage(i + 1), wait);
  }
};

nextTypingStage(0);

// Animation cycle
const flakeStarCycle = async () => {
  const cont = document.querySelector('#background');
  const faceimg = document.getElementById('faceimg');
  const createStar = (i) => {
    const star = document.createElement('div');
    star.style.width = '0.5vw';
    star.style.height = '0.5vw';
    star.style.backgroundColor = 'white';
    star.className = 'bg-stars';
    star.id = `flake${i}`;
    const y = Math.random();
    star.style.left = `${Math.random() * 90 + 5}vw`;
    star.style.top = `${y * 195}vh`;
    star.style.opacity = 1 - y;
    return star;
  };

  const removeElement = (el, delay) => {
    setTimeout(() => {
      el.style.transition = 'opacity 2s';
      el.style.opacity = 0;
      setTimeout(() => cont.removeChild(el), 2000);
    }, delay);
  };

  for (let i = 0; i < 5000000; i++) {
    // update the thingy
    if (i % 20 == 0) {
      const imageindex = ((i / 20) % 10) + 1;
      faceimg.src = `assets/peeppics/${myperson}/${imageindex}.png`;
    }

    const star = createStar(i);
    cont.appendChild(star);
    removeElement(star, 2000);

    if (i % 7 === 0) {
      const flake = document.createElement('snowflake-element');
      flake.className = 'flake';
      cont.appendChild(flake);
      removeElement(flake, 10000);
    }

    document.documentElement.style.setProperty('--rand', Math.random());
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

flakeStarCycle();

// Scroll handler
window.addEventListener('scroll', () => {
  document.documentElement.style.setProperty('--scroll', window.scrollY);
});
//
async function removeImageBackground(image) {
  const backgroundColor = {red: 253, green: 248, blue: 229};
  const threshold = 10;

  const imageElement = new Image();
  imageElement.src = image;
  await new Promise(function (resolve) {
    imageElement.addEventListener('load', resolve);
  });

  var canvas = document.createElement('canvas');
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  var ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i];
    const green = imageData.data[i + 1];
    const blue = imageData.data[i + 2];
    if (
      Math.abs(red - backgroundColor.red) < threshold &&
      Math.abs(green - backgroundColor.green) < threshold &&
      Math.abs(blue - backgroundColor.blue) < threshold
    ) {
      imageData.data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL(`image/png`);
}

// the thingies themselves.............
for (let i = 1; i <= 3; i++) {
  const tope = document.querySelector(`.topimg.box${i}`);
  const gift = document.querySelector(`.award-element.box${i}`);
  gift.src = `assets/awards/${myperson}-${i}.png`;
  var running = false;
  if (tope) {
    console.log(tope);
    tope.addEventListener(
      'click',
      (function (i_copy) {
        return function () {
          if (!running) {
            this.style.animation = 'topdissapear 1s forwards';
            // get time
            running = true;

            setTimeout(() => {
              const award = document.querySelector(`.award-element.box${i}`);
              const seconds = new Date().getTime();
              console.log(seconds);
              award.style.animation = 'awardappear 10s forwards';
              setTimeout(() => {
                running = false;
              }, 10 * 1000);
              this.opacity = 0;
              const bottom = document.querySelector(`.bottomimg.box${i}`);
              bottom.style.pointerEvents = 'none';
              bottom.className = bottom.className.replace(/hover/g, '');
              bottom.style.opacity = 1;

              setTimeout(() => {
                bottom.style.opacity = 0;
              }, 1000);
            }, 1000);
          }
        };
      })(i)
    );
  }
}
