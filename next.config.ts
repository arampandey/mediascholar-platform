import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "erik-utilities-sender-powell.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  images: { remotePatterns: [{ protocol: "https", hostname: "mediascholar.in" }] },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: "/paper/:id*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/author/:id*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
