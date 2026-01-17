// src/pages/open-graph/[...route].ts
import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";
import { getSlugFromPath } from "../[slug].astro";

const posts = await getCollection("posts");
const pages: Record<string, { title: string; description?: string }> = {};
for (const post of posts) {
  pages[getSlugFromPath(post.filePath ?? "")] = {
    title: post.data.title || "!",
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages,

  // Basic template for our OG images
  getImageOptions: (_, page) => ({
    title: page.title,
    logo: {
      path: "./src/pages/open-graph/logo.png",
      size: [300, undefined] as const,
    },
    bgGradient: [[0, 0, 0] as const, [241, 91, 91] as const],
    font: {
      title: {
        families: ["Inter Tight", "sans-serif"],
        color: [255, 255, 255] as const,
      },
    },
    fonts: ["./src/pages/open-graph/InterTight.ttf"],
  }),
});
