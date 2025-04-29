import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://aadishv.github.io",
  base: "/",
  integrations: [
    react(), 
    tailwind()
  ],
  vite: {
    css: {
      preprocessorOptions: {
        less: {
          // Add support for node_modules imports in LESS files
          javascriptEnabled: true,
          math: 'always',
          paths: ['node_modules']
        }
      }
    },
    resolve: {
      alias: {
        // This will help resolve the tilde imports
        '~@': '/node_modules/@'
      }
    }
  }
});