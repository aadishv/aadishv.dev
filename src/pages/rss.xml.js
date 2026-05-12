import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

const getSlugFromPath = (path) =>
  path
    .split("/")
    .pop()
    .replace(/(?:\.(?:svg|html))?\.[^.]+$/, "");

export async function GET(context) {
  const allPosts = await getCollection("posts");

  const posts = allPosts
    .filter((post) => !post.data.hidden)
    .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  return rss({
    title: "Aadish Verma",
    description:
      "Personal blog and projects by Aadish Verma, a student at Stanford Online High School passionate about STEM.",
    site: context.site || "https://aadishv.dev",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description || "",
      link: `/${getSlugFromPath(post.filePath ?? post.id)}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
