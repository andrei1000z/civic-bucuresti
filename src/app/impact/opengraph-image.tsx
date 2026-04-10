import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";
import { getSesizariStatsCached } from "@/lib/cached-queries";

export const runtime = "nodejs";
export const alt = "Impact Civia — dashboard public";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ImpactOG() {
  const stats = await getSesizariStatsCached().catch(() => ({ total: 0, rezolvate: 0, today: 0, inLucru: 0 }));
  const pctResolved = stats.total > 0 ? Math.round((stats.rezolvate / stats.total) * 100) : 0;

  return new ImageResponse(
    buildOgCard({
      badge: "Dashboard public",
      title: "Impactul platformei Civia",
      subtitle: "Sesizări civice raportate de cetățeni. Actualizat automat.",
      accent: "#1C4ED8",
      icon: "📊",
      metrics: [
        { label: "Sesizări depuse", value: stats.total.toLocaleString("ro-RO") },
        { label: "Rezolvate", value: `${pctResolved}%` },
        { label: "În lucru", value: stats.inLucru.toLocaleString("ro-RO") },
        { label: "Astăzi", value: stats.today.toLocaleString("ro-RO") },
      ],
    }),
    size
  );
}
