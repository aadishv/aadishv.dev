// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,svg}"],
  theme: {
    extend: {
      fontFamily: {
        lora: ["Lora", "American Typewriter"],
      },
      colors: {
        header: "#0851D0",
        header2: "#82A9E5",
      },
      keyframes: {
        rollin: {
          "0%": {
            transform: "translateY(30%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "chinese-widen": {
          "0%": {
            width: "0px",
            opacity: 0,
          },
          "75%": {
            width: "1.75rem",
            opacity: 0.2,
          },
          "100%": {
            width: "1.75rem",
            opacity: 1,
          },
        },
      },
      animation: {
        "roll-in": "rollin 1s linear",
        "chinese-widen": "chinese-widen 1s linear",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
