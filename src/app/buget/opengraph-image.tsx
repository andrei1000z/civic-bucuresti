import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";
import { BUGET_NATIONAL } from "@/data/date-publice";

export const runtime = "nodejs";
export const alt = "Buget național România — Civia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function BugetOG() {
  const latest = BUGET_NATIONAL[BUGET_NATIONAL.length - 1]!;
  return new ImageResponse(
    buildOgCard({
      badge: "Transparență fiscală",
      title: "Bugetul României",
      subtitle: `Unde merg banii publici. An ${latest.year}.`,
      accent: "#f59e0b",
      icon: "💰",
      metrics: [
        { label: "Venituri", value: `${latest.venituri.toFixed(0)} mld` },
        { label: "Cheltuieli", value: `${latest.cheltuieli.toFixed(0)} mld` },
        { label: "Deficit / PIB", value: `${latest.deficitProcPib.toFixed(1)}%` },
        { label: "PIB", value: `${(latest.pib / 1000).toFixed(2)} tril` },
      ],
    }),
    size
  );
}
