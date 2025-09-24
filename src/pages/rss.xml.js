import rss from '@astrojs/rss';

export async function GET(context) {
  // Import all blog posts from the content directory
  const allPosts = import.meta.glob('../content/posts/*.md', { eager: true });

  // Convert the glob result to an array and sort by date
  const posts = Object.values(allPosts)
    .filter((post) => !post.frontmatter.hidden) // Exclude hidden posts
    .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));

  return rss({
    title: 'Aadish Verma',
    description: 'Personal blog and projects by Aadish Verma, a student at Stanford Online High School passionate about STEM.',
    site: context.site || 'https://aadishv.dev',
    items: posts.map((post) => {
      // Extract slug from file path
      const slug = post.file.split('/').pop().replace('.md', '');

      // Get a safe description
      let description = post.frontmatter.description || '';
      if (!description && post.rawContent) {
        // Use the raw content if available, strip markdown and truncate
        const rawText = post.rawContent()
          .replace(/---[\s\S]*?---/, '') // Remove frontmatter
          .replace(/#+/g, '') // Remove markdown headers
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
          .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
          .trim();
        description = rawText.slice(0, 200) + (rawText.length > 200 ? '...' : '');
      }

      return {
        title: post.frontmatter.title,
        pubDate: new Date(post.frontmatter.date),
        description: description,
        link: `/${slug}/`,
        categories: post.frontmatter.categories || [],
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
