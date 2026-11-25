import { ImageResponse } from "next/og";

// Share card shown when a Media Scholar link is posted on WhatsApp, LinkedIn, X etc.
export const alt = "Media Scholar — peer-reviewed open access journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "80px", background: "#1a2744", color: "white",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>Media Scholar</div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#c7d2fe" }}>Peer-reviewed, open access journal of media studies</div>
        <div style={{ fontSize: 30, marginTop: 48, color: "#93c5fd" }}>ISSN 3048-5029 · Hindi &amp; English · mediascholar.in</div>
      </div>
    ),
    { ...size }
  );
}
