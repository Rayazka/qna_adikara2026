import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cache Components dimatikan: butuh pola Suspense khusus untuk route dinamis
     (cookies/params), belum sepadan untuk ultra-MVP 1-3 hari. */
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
