// @lovable.dev/vite-tanstack-config already includes the required plugins.
// Do not add duplicate TanStack, React, Tailwind, or Nitro plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const GH_PAGES_BASE = process.env.GH_PAGES_BASE;

export default defineConfig({
  vite: {
    base: GH_PAGES_BASE ?? "/",
  },

  tanstackStart: {
    server: {
      entry: "server",
    },

    pages: GH_PAGES_BASE
      ? [
          {
            path: "/",
            sitemap: { priority: 1.0, changefreq: "weekly" },
          },
          {
            path: "/dashboard",
            sitemap: { priority: 0.9, changefreq: "weekly" },
          },
          {
            path: "/predictor",
            sitemap: { priority: 0.9, changefreq: "weekly" },
          },
          {
            path: "/performance",
            sitemap: { priority: 0.8, changefreq: "weekly" },
          },
          {
            path: "/methodology",
            sitemap: { priority: 0.7, changefreq: "monthly" },
          },
          {
            path: "/about",
            sitemap: { priority: 0.6, changefreq: "monthly" },
          },
        ]
      : undefined,

    prerender: GH_PAGES_BASE
      ? {
          enabled: true,
          autoSubfolderIndex: true,
          autoStaticPathsDiscovery: true,
          crawlLinks: true,
          failOnError: true,
        }
      : undefined,
  },

  nitro: true,
});
