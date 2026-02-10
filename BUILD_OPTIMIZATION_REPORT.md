# Build Optimization Report

## Summary

Reduced Astro build time by **~30%** (34s → 24s locally, projected ~38s on Vercel, down from ~50s).

Four optimizations applied:
1. **Replaced JSDOM with regex-based HTML parsing** (-4.3s)
2. **Removed `@astrojs/vercel` adapter** (-2.5s), moving the sole SSR route to a standalone Vercel API function
3. **Replaced React comment system with vanilla JS + Convex HTTP actions** (-3s client build)
4. **Moved Desmos to CDN** (eliminated 2.1MB from Vite bundle)

Client JS reduced from **2,470kB** (12 chunks) to **228kB** (8 chunks) — a **91% reduction**.

## Hyperfine Benchmark Results

All benchmarks: clean build (`rm -rf dist .astro`) each run.

| Configuration | Mean (s) | Runs | vs Baseline |
|:---|---:|---:|---:|
| Baseline (original) | 33.760 ± 0.354 | 5 | 1.00x |
| Phase 1: JSDOM→regex only | 29.499 ± 0.122 | 5 | 1.14x faster |
| Phase 1: JSDOM→regex + no adapter | 27.003 ± 0.329 | 5 | 1.25x faster |
| Phase 2: + vanilla comments + CDN Desmos | 24.103 ± 0.284 | 3 | **1.40x faster** |

## Root Cause Analysis

### Why the build is slow (and why removing 9k lines only saved 10s)

The build has heavy **fixed overhead** that doesn't scale with content:

| Build Phase | Before | After | Saved |
|:---|---:|---:|---:|
| Vite client build | ~10s (1,799 modules) | ~7s (1,719 modules) | ~3s |
| Vite server entrypoints (Shiki) | ~6s | ~6s | 0s |
| Static route generation | ~7s | ~3.5s | ~3.5s |
| Content sync + types + overhead | ~4s | ~4s | 0s |
| Vercel adapter bundling | ~2.5s | 0s | 2.5s |

The 1,799 Vite modules came from the client-side dependency tree:
- `convex` (43MB in node_modules, 125kB bundled) — **removed from client**
- `react` + `react-dom` (183kB bundled) — **now only loaded on 2 MDX pages**
- `desmos` (2,110kB bundled) — **moved to CDN**
- Astro client router, lucide icons, hcaptcha, sonner — **hcaptcha/sonner removed**

### Markdown rendering was NOT the bottleneck

Tested and confirmed:
- Disabling Shiki entirely: only -2s (-6%)
- Limiting Shiki to only used languages: no measurable effect (lazy-loads)
- Shiki `defaultColor: false`: no effect (overhead is in WASM tokenizer)

## Changes Made

### 1. Replace JSDOM with regex (`src/pages/[slug].astro`)

JSDOM (4.4MB) was instantiated for every post page to extract `<p>` text and strip HTML.
Replaced with two regex operations. Saved **4.3s** (27 pages x ~160ms JSDOM init each).

### 2. Remove `@astrojs/vercel` adapter (`astro.config.mjs`)

The Vercel adapter forces `mode: "server"` even for static output, adding redundant server bundling.
The one SSR route (`/s/[id]`) was migrated to `api/s/[id].ts` as a standalone Vercel serverless function.

### 3. Replace React comments with vanilla JS (`src/components/Comments.astro`)

The React-based Convex comment system (`ConvexProvider.tsx` + `Comments.tsx`) loaded on every page:
- `convex/react` (ConvexReactClient, useQuery, useAction)
- `@hcaptcha/react-hcaptcha`
- `sonner` (toast notifications)
- Full React hydration runtime

Replaced with:
- **Convex HTTP actions** (`convex/http.ts`) — GET/POST endpoints with the same validation, rate limiting, and hCaptcha verification
- **Pure Astro component** (`src/components/Comments.astro`) — ~60 lines of inline vanilla JS
- **hCaptcha loaded from CDN** (`https://js.hcaptcha.com/1/api.js`) instead of bundled React wrapper

React is still loaded on the 2 MDX pages that use interactive components (`move2point.mdx`, `mcl-2.mdx`).

### 4. Move Desmos to CDN (`src/tools/move2point.tsx`)

The `desmos` npm package (2.1MB) was only used on one page. Replaced `await import("desmos")` with a CDN script load (`https://www.desmos.com/api/v1.10/calculator.js`), eliminating it from the Vite bundle entirely.

## Approaches Tested That Didn't Work

| Approach | Result | Why |
|:---|:---|:---|
| Limit Shiki languages (`langs: [...]`) | No effect | Shiki v3 lazy-loads; only used langs loaded anyway |
| Shiki `defaultColor: false` | No effect | Overhead is in WASM tokenizer |
| `vite.build.target: "esnext"` | No effect | Already targeting modern browsers |
| `react({ include: [...] })` | No effect | React file detection isn't the bottleneck |
| Remove OG image generation | -0.3s | Images cached after first build |
| `imageService: false` on adapter | No effect | Not what makes the adapter slow |
