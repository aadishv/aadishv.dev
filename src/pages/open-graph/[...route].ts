// src/pages/open-graph/[...route].ts
import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";
import { getSlugFromPath } from "../[slug].astro";
import { JSDOM } from "jsdom";

const posts = await getCollection("posts");
const pages: Record<string, { title: string; description?: string }> = {};

for (const post of posts) {
  const slug = getSlugFromPath(post.filePath ?? "");
  const dom = new JSDOM(
    `<!doctype html><html><body>${post.rendered?.html ?? ""}</body></html>`,
  );
  const firstParagraph = Array.from(dom.window.document.querySelectorAll("p"))
    .map((node) => node.textContent?.trim())
    .find(Boolean);

  pages[slug] = {
    title: post.data.title || "Aadish Verma",
    description: firstParagraph || "aadishv.dev",
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[250, 250, 250]],
    border: {
      color: [20, 20, 20],
      width: 8,
      side: "block-start",
    },
    padding: 72,
    font: {
      title: {
        families: ["Inter Tight", "sans-serif"],
        color: [20, 20, 20],
        size: 68,
        lineHeight: 1.05,
        weight: "Bold",
      },
      description: {
        families: ["Inter Tight", "sans-serif"],
        color: [90, 90, 90],
        size: 28,
        lineHeight: 1.35,
        weight: "Normal",
      },
    },
    fonts: ["./src/pages/open-graph/InterTight.ttf"],
  }),
});
