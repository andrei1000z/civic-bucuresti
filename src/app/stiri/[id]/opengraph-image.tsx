import { ImageResponse } from "next/og";
import { createSupabaseAnon } from "@/lib/supabase/admin";
import { SOURCE_COLORS } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = "Articol pe Civia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface StireRow {
  title: string;
  source: string;
  category: string;
  published_at: string;
}

async function getStire(id: string): Promise<StireRow | null> {
  try {
    const supabase = createSupabaseAnon();
    const { data } = await supabase
      .from("stiri_cache")
      .select("title, source, category, published_at")
      .eq("id", id)
      .maybeSingle();
    return (data as StireRow | null) ?? null;
  } catch {
    return null;
  }
}

export default async function StireOG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stire = await getStire(id);

  if (!stire) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#fff",
            fontSize: 64,
          }}
        >
          Civia — Știri
        </div>
      ),
      size
    );
  }

  const sourceColor = SOURCE_COLORS[stire.source] ?? "#1C4ED8";
  const dateRo = new Date(stire.published_at).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, #0f172a 0%, ${sourceColor}dd 100%)`,
          padding: 80,
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2,
              padding: "8px 16px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 8,
            }}
          >
            📰 {stire.source}
          </div>
          <div style={{ fontSize: 20, opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>
            {stire.category}
          </div>
        </div>

        <div
          style={{
            fontSize: stire.title.length > 100 ? 54 : 64,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "auto",
            maxWidth: 1040,
            display: "flex",
          }}
        >
          {stire.title.slice(0, 140)}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 40,
          }}
        >
          <div style={{ fontSize: 24, opacity: 0.85, display: "flex" }}>📅 {dateRo}</div>
          <div style={{ fontSize: 28, fontWeight: 700, display: "flex" }}>civia.ro</div>
        </div>
      </div>
    ),
    size
  );
}
