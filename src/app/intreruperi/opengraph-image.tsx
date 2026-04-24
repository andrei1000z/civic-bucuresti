import { ImageResponse } from "next/og";
import { getActiveInterruptions, TYPE_ICONS, TYPE_LABELS } from "@/data/intreruperi";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Întreruperi programate — Civia";

export default function OgImage() {
  const all = getActiveInterruptions();
  const countByType: Record<string, number> = {};
  for (const i of all) countByType[i.type] = (countByType[i.type] ?? 0) + 1;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "white",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🚧
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, opacity: 0.9 }}>Civia</span>
        </div>

        <h1
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 24,
          }}
        >
          Întreruperi
          <br />
          programate
        </h1>

        <p style={{ fontSize: 32, opacity: 0.92, marginBottom: 48, maxWidth: 900 }}>
          Apă · Caldură · Gaz · Curent · Lucrări la stradă
        </p>

        <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
          {(["apa", "caldura", "gaz", "electricitate", "lucrari-strazi"] as const).map((t) => (
            <div
              key={t}
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                borderRadius: 20,
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 140,
              }}
            >
              <span style={{ fontSize: 32, marginBottom: 4 }}>{TYPE_ICONS[t]}</span>
              <span style={{ fontSize: 36, fontWeight: 800 }}>{countByType[t] ?? 0}</span>
              <span style={{ fontSize: 18, opacity: 0.85 }}>{TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
