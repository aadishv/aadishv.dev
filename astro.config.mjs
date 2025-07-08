import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import topLevelAwait from "vite-plugin-top-level-await";
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
  vite: {
      plugins: [
        topLevelAwait({
          // The export name of top-level await promise for each chunk module
          promiseExportName: '__tla',
          // The function to generate import names of top-level await promise in each chunk module
          promiseImportName: i => `__tla_${i}`
        })
      ]
    }
});
