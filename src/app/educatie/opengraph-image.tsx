import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";
import { BAC_STATS } from "@/data/date-publice";

export const runtime = "nodejs";
export const alt = "Educație România — statistici BAC";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function EducatieOG() {
  const latest = BAC_STATS[BAC_STATS.length - 1]!;
  return new ImageResponse(
    buildOgCard({
      badge: "Învățământ",
      title: "Educația în România",
      subtitle: `Bacalaureat ${latest.year}. Top licee, abandon școlar, context UE.`,
      accent: "#8b5cf6",
      icon: "🎓",
      metrics: [
        { label: "Promovabilitate BAC", value: `${latest.promovabilitate.toFixed(1)}%` },
        { label: "Prezenți", value: `${(latest.prezenti / 1000).toFixed(0)}k` },
        { label: "Note de 10", value: `${latest.note10}` },
        { label: "Medii ≥ 6", value: `${Math.round((latest.note6plus / latest.prezenti) * 100)}%` },
      ],
    }),
    size
  );
}
