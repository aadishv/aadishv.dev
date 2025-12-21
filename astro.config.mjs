import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import rehypeSlug from "rehype-slug";
import mdx from "@astrojs/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      // include: ["**/*/react/*"],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap(),
  ],

  markdown: {
    syntaxHighlight: "shiki", // or 'prism'
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          content: {
            type: "text",
            value: `#`,
          },
          headingProperties: {
            className: ["anchor"],
          },
          properties: {
            className: ["anchor-link"],
          },
        },
      ],
    ],
  },

  site: "https://www.aadishv.dev",
  base: "",
  output: "static",
  adapter: vercel(),
});
