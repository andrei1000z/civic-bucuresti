import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon (180×180). Same visual as favicon — gradient emerald
 * + extrabold "C". iOS uses this for home-screen install + Safari pinned tab.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 60%, #064e3b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          // Bigger + thinner: weight 600, size 150 (vs 130).
          // No letter-spacing — single char + flex-center îl decentrează.
          fontSize: 150,
          fontWeight: 600,
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderRadius: "40px",
          lineHeight: 1,
        }}
      >
        C
      </div>
    ),
    size,
  );
}
