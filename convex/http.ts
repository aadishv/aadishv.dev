import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { rateLimiter } from "./comments";

const secret = process.env.HCAPTCHA_SECRET;

const http = httpRouter();

http.route({
  path: "/comments",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    const comments = await ctx.runQuery(api.comments.getComments, { slug });
    return new Response(JSON.stringify(comments), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

http.route({
  path: "/comments",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { slug, body, token } = await request.json();

    if (!body || body.trim() === "") {
      return jsonResponse({ error: "Haha nice try smh" }, 400);
    }
    if (body.trim().length > 200) {
      return jsonResponse({ error: "Bro are you writing an essay?" }, 400);
    }

    const { ok } = await rateLimiter.limit(ctx, "addComment");
    if (!ok) {
      return jsonResponse({ error: "Bruh are you botting, slow down bro" }, 429);
    }

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secret!, response: token }),
    });
    const data = (await response.json()) as { success: boolean };
    if (!data.success) {
      return jsonResponse({ error: "You're giving robot ngl" }, 403);
    }

    await ctx.runMutation(internal.comments.addCommentInternal, {
      slug,
      body: body.trim(),
    });
    return jsonResponse({ ok: true }, 200);
  }),
});

http.route({
  path: "/comments",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

function jsonResponse(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

export default http;
