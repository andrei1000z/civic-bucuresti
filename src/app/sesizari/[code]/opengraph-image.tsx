import { ImageResponse } from "next/og";
import { getSesizareByCode } from "@/lib/sesizari/repository";

export const runtime = "nodejs"; // need full Node.js for supabase
export const alt = "Sesizare Civia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATUS_COLORS: Record<string, string> = {
  "nou": "#3b82f6",
  "in-lucru": "#f59e0b",
  "rezolvat": "#10b981",
  "respins": "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  "nou": "Nou",
  "in-lucru": "În lucru",
  "rezolvat": "Rezolvat",
  "respins": "Respins",
};

const TIP_ICONS: Record<string, string> = {
  groapa: "🕳️",
  trotuar: "🚶",
  iluminat: "💡",
  copac: "🌳",
  gunoi: "🗑️",
  parcare: "🅿️",
  stalpisori: "🧱",
  canalizare: "🚰",
  semafor: "🚦",
  pietonal: "🛑",
  graffiti: "🎨",
  mobilier: "🪑",
  zgomot: "🔊",
  animale: "🐾",
  transport: "🚌",
  altele: "📝",
};

export default async function SesizareOG({ params }: { params: { code: string } }) {
  const sesizare = await getSesizareByCode(params.code).catch(() => null);

  const title = sesizare?.titlu ?? "Sesizare negăsită";
  const status = sesizare?.status ?? "nou";
  const tip = sesizare?.tip ?? "altele";
  const sector = sesizare?.sector ?? "";
  const locatie = sesizare?.locatie ?? "";
  const statusColor = STATUS_COLORS[status] ?? "#64748b";
  const statusLabel = STATUS_LABELS[status] ?? status;
  const tipIcon = TIP_ICONS[tip] ?? "📝";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1C4ED8 100%)",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "linear-gradient(135deg, #ffffff, #dbeafe)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            🏙️
          </div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>Civia</div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 999,
              background: statusColor,
              color: "#fff",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
            color: "#bfdbfe",
            fontSize: 24,
          }}
        >
          <span style={{ fontSize: 40 }}>{tipIcon}</span>
          <span style={{ textTransform: "capitalize" }}>{tip}</span>
          {sector && (
            <>
              <span>·</span>
              <span>{sector}</span>
            </>
          )}
        </div>

        <div
          style={{
            color: "#fff",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 1040,
            letterSpacing: -1.5,
            marginBottom: 20,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        {locatie && (
          <div
            style={{
              color: "#cbd5e1",
              fontSize: 26,
              maxWidth: 1040,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            📍 {locatie}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(255,255,255,0.7)",
            fontSize: 20,
          }}
        >
          <div style={{ fontFamily: "monospace" }}>
            #{params.code}
          </div>
          <div>civia.ro/sesizari/{params.code}</div>
        </div>
      </div>
    ),
    size
  );
}
