import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "erik-utilities-sender-powell.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  images: { remotePatterns: [{ protocol: "https", hostname: "mediascholar.in" }] },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mediascholar.in" }],
        destination: "https://mediascholar.in/:path*",
        permanent: true,
      },
    ];
  },
  // Google Scholar wants the PDF in the same folder as the abstract page (/paper/<id>),
  // so /paper/<id>.pdf is served by the existing /pdfs/<id>.pdf route. Nothing else changes.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/paper/:id.pdf", destination: "/pdfs/:id.pdf" },
      ],
    };
  },
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
