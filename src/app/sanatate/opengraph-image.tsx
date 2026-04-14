import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";
import { SANATATE_NATIONALA } from "@/data/date-publice";

export const runtime = "nodejs";
export const alt = "Sănătate România — Civia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function SanatateOG() {
  const latest = SANATATE_NATIONALA[SANATATE_NATIONALA.length - 1]!;
  return new ImageResponse(
    buildOgCard({
      badge: "Sănătate publică",
      title: "Sănătatea în România",
      subtitle: `Sistem medical românesc în cifre. An ${latest.year}.`,
      accent: "#ef4444",
      icon: "❤️",
      metrics: [
        { label: "Speranță viață", value: `${latest.sperantaViataAni.toFixed(1)} ani` },
        { label: "Mort. infantilă", value: `${latest.mortInfantilaLa1000.toFixed(1)}‰` },
        { label: "Medici / 1000", value: latest.mediciLa1000Loc.toFixed(2) },
        { label: "% din PIB", value: `${latest.cheltuialaPibProc.toFixed(1)}%` },
      ],
    }),
    size
  );
}
