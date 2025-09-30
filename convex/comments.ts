import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getComments = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
  },
});

export const addComment = mutation({
  args: { slug: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    if (args.body.trim() === "") {
      throw new Error("Comment body cannot be empty");
    }
    await ctx.db.insert("comments", {
      slug: args.slug,
      body: args.body.trim(),
    });
  },
});