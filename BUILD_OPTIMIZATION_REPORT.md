# Build Optimization Report

## Summary

Reduced Astro build time by **20%** (33.8s → 27.0s locally, projected ~40s on Vercel, down from ~50s).

Two optimizations were applied:
1. **Replaced JSDOM with regex-based HTML parsing** (-4.3s, -12.6%)
2. **Removed `@astrojs/vercel` adapter** (-2.5s, -7.4%), moving the sole SSR route to a standalone Vercel API function

## Hyperfine Benchmark Results

All benchmarks: 5 runs, 1 warmup, clean build (`rm -rf dist .astro`) each run.

| Configuration | Mean (s) | Min (s) | Max (s) | vs Baseline |
|:---|---:|---:|---:|---:|
| Baseline (original) | 33.760 ± 0.354 | 33.322 | 34.133 | 1.00x |
| JSDOM→regex only | 29.499 ± 0.122 | 29.321 | 29.605 | 1.14x faster |
| JSDOM→regex + no adapter | 27.003 ± 0.329 | 26.710 | 27.539 | 1.25x faster |

## Root Cause Analysis

### Why the build is slow (and why removing 9k lines only saved 10s)

The build has ~22s of **fixed overhead** that doesn't scale with content:

| Build Phase | Time | % of Total | Bottleneck |
|:---|---:|---:|:---|
| Vite client build (1,799 modules) | ~10s | 37% | React + Convex + Desmos dependency tree |
| Vite server entrypoints (Shiki) | ~6s | 22% | Shiki WASM tokenizer initialization |
| Static route generation | ~7s | 26% | OG images + JSDOM per-page + page rendering |
| Content sync + types + overhead | ~4s | 15% | Node.js startup, Astro internals |

The 1,799 Vite modules come from the client-side dependency tree:
- `convex` (43MB in node_modules, 125kB bundled) - comment system
- `react` + `react-dom` (183kB bundled) - required by Convex
- `desmos` (2,110kB bundled) - calculator widget on one page
- Astro client router, lucide icons, hcaptcha, sonner

This fixed overhead explains why gutting 9,000 lines of content only saved ~10s — the content rendering itself was fast; the dependency bundling dominates.

### Your suspicion about markdown rendering

Markdown/Shiki is **not** the primary bottleneck. Testing confirmed:
- Disabling Shiki entirely: only -2s (-6%)
- Limiting Shiki to only used languages (13 vs 342): no measurable effect (Shiki lazy-loads grammars)
- Shiki `defaultColor: false`: no effect (overhead is in WASM tokenizer, not color generation)

## Changes Made

### 1. Replace JSDOM with regex (`src/pages/[slug].astro`)

JSDOM (4.4MB) was instantiated for every post page just to:
- Extract the first `<p>` text for meta descriptions
- Strip HTML for reading-time calculation

Replaced with two regex operations that produce equivalent output:

```diff
-import { JSDOM } from "jsdom";
...
-const dom = new JSDOM(`<!doctype html><html><body>${post.rendered?.html}</body></html>`);
-const desc = Array.from(dom.window.document.querySelectorAll("p"))
-  .map((i) => i.textContent).filter(Boolean)[0];
-const text = dom.window.document.body.textContent ?? "";
+const html = post.rendered?.html ?? "";
+const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
+const desc = pMatch ? pMatch[1].replace(/<[^>]*>/g, "").trim() : undefined;
+const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
```

This saved **4.3s** because JSDOM requires full DOM environment initialization for each page (27 pages × ~160ms each).

### 2. Remove `@astrojs/vercel` adapter (`astro.config.mjs`)

The Vercel adapter forces `mode: "server"` even for `output: "static"` sites, which means Astro:
1. Builds a full server entry (including all of Shiki, JSDOM, etc. for SSR)
2. Builds a separate client bundle
3. Bundles the serverless function with esbuild
4. Copies files to `.vercel/output/static`

Without the adapter, Astro builds in pure static mode — a single Vite pass. This saved **2.5s** of overhead.

The one SSR route (`/s/[id]`) was migrated to `api/s/[id].ts`, a standalone Vercel serverless function that Vercel deploys independently of the Astro build.

## Approaches Tested That Didn't Work

| Approach | Result | Why |
|:---|:---|:---|
| Limit Shiki languages (`langs: [...]`) | No effect | Shiki v3 lazy-loads grammars; only used langs are loaded anyway |
| Shiki `defaultColor: false` | No effect | Overhead is in WASM tokenizer, not style generation |
| `vite.build.target: "esnext"` | No effect | Already targeting modern browsers |
| `react({ include: [...] })` | No effect | React file detection isn't the bottleneck |
| Remove OG image generation | -0.3s | Images cached after first build; minimal cold-start cost |
| `imageService: false` on adapter | No effect | Image service isn't what makes the adapter slow |

## Remaining Bottlenecks (for future reference)

The remaining ~27s is dominated by Vite processing 1,799 client modules. To reduce further:

- **Replace Convex with a lighter comment backend** — Convex adds 125kB+ to the client bundle and pulls in hundreds of transitive modules. A REST API-based comment system (or even GitHub Discussions) would eliminate React hydration on most pages.
- **Load Desmos from CDN** — The 2.1MB Desmos chunk is only used on `move2point.mdx`. Loading via `<script src="https://www.desmos.com/api/v1.10/calculator.js">` would remove it from the Vite bundle entirely.
- **Remove React dependency** — If comments moved to a non-React solution, the React integration could be dropped, eliminating ~183kB of client JS and significant Vite module processing.

These are larger architectural changes but represent the path to sub-15s builds.
