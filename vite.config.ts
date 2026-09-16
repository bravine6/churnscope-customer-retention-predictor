// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages needs the repository name as the base path. In the GitHub Actions
// workflow we set GH_PAGES_BASE to "/churnscope-customer-retention-predictor/".
// Locally and in the Lovable preview we keep "/" so routes and assets resolve normally.
const GH_PAGES_BASE = process.env.GH_PAGES_BASE;

export default defineConfig({
  vite: {
    base: GH_PAGES_BASE ?? "/",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  // GitHub Pages needs a static export, so pin the nitro preset to "static".
  // Lovable's own build ignores this because it sets LOVABLE_NITRO_PRESET.
  nitro: GH_PAGES_BASE ? { preset: "static" } : true,
  // Prerender the known routes so GitHub Pages receives real HTML files.
  pages: GH_PAGES_BASE
    ? [
        { path: "/", sitemap: { priority: 1.0, changefreq: "weekly" } },
        { path: "/dashboard", sitemap: { priority: 0.9, changefreq: "weekly" } },
        { path: "/predictor", sitemap: { priority: 0.9, changefreq: "weekly" } },
        { path: "/performance", sitemap: { priority: 0.8, changefreq: "weekly" } },
        { path: "/methodology", sitemap: { priority: 0.7, changefreq: "monthly" } },
        { path: "/about", sitemap: { priority: 0.6, changefreq: "monthly" } },
      ]
    : undefined,
  prerender: GH_PAGES_BASE
    ? {
        enabled: true,
        filter: () => true,
      }
    : undefined,
});
