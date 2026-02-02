// src/pages/open-graph/[...route].ts
import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";
import { getSlugFromPath } from "../[slug].astro";
import fs from "node:fs";

const posts = await getCollection("posts");
const pages: Record<string, { title: string; description?: string }> = {};
for (const post of posts) {
  pages[getSlugFromPath(post.filePath ?? "")] = {
    title: post.data.title || "!",
  };
}

const cssContent = fs.readFileSync(
  new URL("../../styles/globals.css", import.meta.url),
  "utf-8",
);
const aadishMatch = cssContent.match(/--aadish:\s*(\d+)\s+(\d+)%\s+(\d+)%/);
const [h, s, l] = aadishMatch
  ? (aadishMatch.slice(1).map(Number) as [number, number, number])
  : [215, 90, 50];

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
}

const aadishColor = hslToRgb(h, s, l);

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
    bgGradient: [[0, 0, 0] as const, aadishColor],
    font: {
      title: {
        families: ["Inter Tight", "sans-serif"],
        color: [255, 255, 255] as const,
      },
    },
    fonts: ["./src/pages/open-graph/InterTight.ttf"],
  }),
});
