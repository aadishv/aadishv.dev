import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";
import { getSlugFromPath } from "../[slug].astro";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const getFirstParagraphText = (html: string) => {
  const match = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  return match ? stripHtml(match[1]) : undefined;
};

const posts = await getCollection("posts");
const pages: Record<string, { title: string; description?: string }> = {};

for (const post of posts) {
  const slug = getSlugFromPath(post.filePath ?? "");
  const firstParagraph = getFirstParagraphText(post.rendered?.html ?? "");

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
