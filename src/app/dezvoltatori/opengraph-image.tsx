import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";

export const runtime = "nodejs";
export const alt = "API public Civia — pentru dezvoltatori";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function DezvoltatoriOG() {
  return new ImageResponse(
    buildOgCard({
      badge: "API v1 · stabil",
      title: "API public Civia",
      subtitle: "Toate sesizările publice. CORS deschis, fără autentificare. CC BY 4.0.",
      accent: "#8b5cf6",
      icon: "⚡",
      metrics: [
        { label: "Rate limit", value: "120/min" },
        { label: "CORS", value: "*" },
        { label: "Licență", value: "CC BY 4.0" },
        { label: "Endpoints", value: "2" },
      ],
    }),
    size
  );
}
