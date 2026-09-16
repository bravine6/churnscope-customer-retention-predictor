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
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
