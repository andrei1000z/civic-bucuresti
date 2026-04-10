import { ImageResponse } from "next/og";
import { evenimente } from "@/data/evenimente";
import { ALL_COUNTIES } from "@/data/counties";

export const runtime = "nodejs";
export const alt = "Eveniment pe Civia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SEVERITY_COLOR: Record<string, string> = {
  critic: "#dc2626",
  major: "#ea580c",
  moderat: "#d97706",
  minor: "#65a30d",
};

const CATEGORY_EMOJI: Record<string, string> = {
  incendiu: "🔥",
  inundatie: "🌊",
  cutremur: "🌍",
  accident: "🚨",
  protest: "📢",
  infrastructura: "🏗️",
};

export default async function EvenimentOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ev = evenimente.find((e) => e.slug === slug);

  if (!ev) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#fff", fontSize: 64 }}>
          Civia
        </div>
      ),
      size
    );
  }

  const countyName = ALL_COUNTIES.find((c) => c.id === ev.county)?.name ?? "";
  const severityColor = SEVERITY_COLOR[ev.severity] ?? "#475569";
  const emoji = CATEGORY_EMOJI[ev.category] ?? "📰";
  const dataRo = new Date(ev.data).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, #0f172a 0%, ${severityColor}cc 100%)`,
          padding: 80,
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{ fontSize: 48 }}>{emoji}</div>
          <div style={{ fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, opacity: 0.9 }}>
            {ev.category} · {ev.severity}
          </div>
        </div>

        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginBottom: 32, maxWidth: 1040, display: "flex" }}>
          {ev.titlu}
        </div>

        <div style={{ fontSize: 28, opacity: 0.85, marginBottom: "auto", display: "flex", gap: 24 }}>
          <span>📅 {dataRo}</span>
          {countyName && <span>📍 {countyName}</span>}
        </div>

        {((ev.victime ?? 0) > 0 || (ev.evacuati ?? 0) > 0 || (ev.echipaje ?? 0) > 0) && (
          <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
            {(ev.victime ?? 0) > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 52, fontWeight: 800 }}>{ev.victime}</div>
                <div style={{ fontSize: 20, opacity: 0.8 }}>victime</div>
              </div>
            )}
            {(ev.evacuati ?? 0) > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 52, fontWeight: 800 }}>{ev.evacuati}</div>
                <div style={{ fontSize: 20, opacity: 0.8 }}>evacuați</div>
              </div>
            )}
            {(ev.echipaje ?? 0) > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 52, fontWeight: 800 }}>{ev.echipaje}</div>
                <div style={{ fontSize: 20, opacity: 0.8 }}>echipaje</div>
              </div>
            )}
          </div>
        )}

        <div style={{ position: "absolute", bottom: 40, right: 80, fontSize: 22, opacity: 0.7, display: "flex" }}>
          civia.ro
        </div>
      </div>
    ),
    size
  );
}
