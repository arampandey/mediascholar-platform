import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "erik-utilities-sender-powell.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  images: { remotePatterns: [{ protocol: "https", hostname: "mediascholar.in" }] },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
