import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import rehypeSlug from "rehype-slug";
import mdx from "@astrojs/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import sitemap from "@astrojs/sitemap";
import { typst } from "astro-typst";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["@myriaddreamin/typst-ts-node-compiler"],
    },
  },
  integrations: [
    solid({ include: ["**/tools/**", "**/components/**"] }),
    mdx(),
    typst({
      target: (id) =>
        id.endsWith(".html.typ") || id.includes("/html/") ? "html" : "svg",
      htmlMode: "text",
      options: {
        cheerio: {
          postprocess: ($) => {
            $("[fill='#000']").attr("fill", "currentColor");
            $("[stroke='#000']").attr("stroke", "currentColor");
            $("svg").addClass("typst-svg");
            return $;
          },
        },
      },
    }),
    sitemap(),
  ],

  markdown: {
    syntaxHighlight: "shiki",
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
});
