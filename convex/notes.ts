import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("notes").first())?.content ?? "No content yet!";
  },
});

export const createNote = mutation({
  args: { content: v.string(), password: v.string() },
  handler: async (ctx, { content, password }) => {
    const envPassword = process.env.PASSWORD;
    if (!envPassword) {
      throw new Error("PASSWORD environment variable is not set");
    }
    if (password !== envPassword) {
      throw new Error("Incorrect password");
    }
    const id = (await ctx.db.query("notes").first())?._id;
    if (!id) {
      await ctx.db.insert("notes", {
        content: content,
      });
    } else {
      await ctx.db.patch(id, {
        content: content,
      });
    }
  },
});
