import * as fs from 'fs';
import * as path from 'path';

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import { format } from 'date-fns';
import { ConvexHttpClient } from 'convex/browser';
import { api } from 'convex/_generated/api';
import matter from 'gray-matter';

const client = new ConvexHttpClient("https://diligent-moose-714.convex.cloud");

const dirPath = __dirname;

const start = performance.now();

const pipeline = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
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
  })
  .use(rehypeShiki, {
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  })
  .use(rehypeStringify);

const notes = await Promise.all(fs.readdirSync(dirPath).map(async file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(dirPath, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content: mdContent } = matter(rawContent);
    const date = new Date(data.date);
    console.log(date, filePath)
    const content = `
      <div id="${file.replace('.md', '')}">
        <div style="margin-bottom: 1rem;">${await pipeline.process(mdContent)}</div>
        <span>
        <a href="#${file.replace('.md', '')}">#</a>,
        <time
          datetime="${date.toISOString()}"
          style="color: hsl(var(--muted-foreground));"
        >
          ${format(
      date,
      "'published at' MMMM d, yyyy 'at' h:mm a",
    )}
        </time>
        </span>
      </div>
      `;
    return {
      content,
      date
    };
  }
})).then(v => v.filter(a => a !== undefined).sort((a, b) => b.date.getTime() - a.date.getTime()).reduce(
  (acc, curr) => `${acc}\n${curr.content} <hr style="margin: 1rem 0;" />`,
  ""
));

console.log(performance.now() - start, "ms");

await client.mutation(api.notes.createNote, {
  content: notes,
  password: process.argv[2]
});


console.log(performance.now() - start, "ms");
