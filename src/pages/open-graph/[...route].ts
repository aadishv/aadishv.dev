// src/pages/open-graph/[...route].ts
import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";
import { getSlugFromPath } from "../[slug].astro";

const pages = await (async () => {
  const posts = await getCollection("posts");
  let pages: Record<string, { title: string, description: string }> = {};
  for (const post of posts) {
    pages[getSlugFromPath(post.filePath ?? '')] = {
      title: post.data.title || "Default title",
    };
  }
  return pages;
})();
console.log(pages);

export const { getStaticPaths, GET } = OGImageRoute({
    param: "route",

  // Generate OG images for all blog posts
  // Replace "blog" with your collection name
  pages,

  // Basic template for our OG images
  getImageOptions: (path, page) => ({
    title: page.title,
    bgImage: {
      path: "./src/pages/open-graph/bg.jpeg",
    },
    font: {
      title: {
        families: ["Georgia", "serif"],
        weight: "SemiBold",
        color: [0, 0, 0],
      }
    },
    fonts: ["./src/pages/open-graph/georgia.ttf"]
  }),
});
console.log("TESTING")
console.log(getStaticPaths({ paginate: (...stuff) => [] }), );
