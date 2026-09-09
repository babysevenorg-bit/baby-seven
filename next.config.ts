import type { NextConfig } from "next";

// Next.js config for the Baby Seven portfolio.
//
// Cloudflare Pages notes (see MIGRATION.md):
// In Next.js 16 the experimental.runtime flag from Next 13 was deprecated.
// The correct way to opt a route into the edge runtime is `export const
// runtime = 'edge'` on each route file. We do that in src/app/api/*.
//
// The standalone output is kept for the existing Node build. The Cloudflare
// build uses `@cloudflare/next-on-pages` and produces its own output, so the
// two build paths don't conflict.
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Unsplash hosts all the project cover images in the seed data.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    ],
  },
};

export default nextConfig;
