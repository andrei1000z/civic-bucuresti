import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";

export const runtime = "nodejs";
export const alt = "Statistici civice România — Civia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function StatisticiOG() {
  return new ImageResponse(
    buildOgCard({
      badge: "Date publice",
      title: "Statistici naționale",
      subtitle: "Accidente rutiere, calitate aer, spații verzi, sesizări cetățeni — agregate din toate cele 42 de județe.",
      accent: "#10b981",
      icon: "📊",
      metrics: [
        { label: "Județe", value: "42" },
        { label: "Surse", value: "INS+DRPCIV" },
        { label: "Actualizare", value: "anual" },
        { label: "Export", value: "API v1" },
      ],
    }),
    size
  );
}
