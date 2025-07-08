import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    syntaxHighlight: "shiki", // or 'prism'
    shikiConfig: {
      theme: "github-light", // or 'github-dark', 'nord', etc.
    },
  },
  site: "https://aadishv.github.io",
  base: "",
});
