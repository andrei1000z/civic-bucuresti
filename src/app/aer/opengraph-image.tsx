import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";

export const runtime = "nodejs";
export const alt = "Calitatea aerului în România — Civia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function AerOG() {
  return new ImageResponse(
    buildOgCard({
      badge: "Date în timp real",
      title: "Calitatea aerului în România",
      subtitle: "Hartă live cu sute de senzori din toată țara. Date de la OpenAQ, Sensor.Community și WAQI — actualizate la 5 minute.",
      accent: "#059669",
      icon: "🌬️",
      metrics: [
        { label: "Surse senzori", value: "4" },
        { label: "Actualizare", value: "5 min" },
        { label: "Acoperire", value: "România" },
        { label: "Cost", value: "gratuit" },
      ],
    }),
    size
  );
}
