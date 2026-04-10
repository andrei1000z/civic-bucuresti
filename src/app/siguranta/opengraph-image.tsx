import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";
import { CRIMINALITATE } from "@/data/date-publice";

export const runtime = "nodejs";
export const alt = "Siguranță publică România — Civia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function SigurantaOG() {
  const latest = CRIMINALITATE[CRIMINALITATE.length - 1];
  return new ImageResponse(
    buildOgCard({
      badge: "Siguranță publică",
      title: "Criminalitate în România",
      subtitle: `Date oficiale Poliția Română. An ${latest.year}.`,
      accent: "#dc2626",
      icon: "🛡️",
      metrics: [
        { label: "Total infracțiuni", value: `${(latest.totalInfractiuni / 1000).toFixed(0)}k` },
        { label: "Violente", value: `${(latest.violente / 1000).toFixed(1)}k` },
        { label: "Patrimoniu", value: `${(latest.patrimoniu / 1000).toFixed(0)}k` },
        { label: "Droguri", value: `${(latest.droguri / 1000).toFixed(1)}k` },
      ],
    }),
    size
  );
}
