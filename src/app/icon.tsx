import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon — match Navbar logo styling: gradient emerald → emerald-900,
 * extrabold "C" centered, rounded squircle. ImageResponse rasterizes to
 * PNG at 32×32 (standard favicon size). Apple-icon.tsx returns 180×180
 * with the same look.
 */
export default function Icon() {
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
          borderRadius: "8px",
          fontSize: 28,
          fontWeight: 600,
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: 1,
          // Push spre stânga + sus: paddingRight bias spre stânga,
          // paddingBottom bias spre sus (flex-center re-centrează în
          // zona rămasă, deci shift = padding/2).
          paddingRight: "10%",
          paddingBottom: "8%",
        }}
      >
        C
      </div>
    ),
    size,
  );
}
