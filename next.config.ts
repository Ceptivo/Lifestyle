import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) locates its worker script relative to its own
  // module file at runtime — bundling it rewrites/hoists that path and breaks
  // worker setup, so it needs to load as a real, un-bundled Node module.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  env: {
    // Baked into the client bundle at build time so BuildVersionWatcher can
    // compare it against the currently-deployed commit. Vercel sets this
    // automatically; falls back for local dev where it's unset.
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
