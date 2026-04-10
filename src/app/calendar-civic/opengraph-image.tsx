import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";
import { getUpcomingEvents } from "@/data/calendar-civic";

export const runtime = "nodejs";
export const alt = "Calendar civic România — Civia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function CalendarOG() {
  const upcoming = getUpcomingEvents(20);
  const nextThree = upcoming.slice(0, 3);
  const subtitle = nextThree.length
    ? `Următoarele: ${nextThree.map((e) => e.title.slice(0, 40)).join(" · ")}`
    : "Alegeri, taxe, ședințe publice, consultări.";

  return new ImageResponse(
    buildOgCard({
      badge: "Calendar civic",
      title: "Date care contează",
      subtitle: subtitle.slice(0, 180),
      accent: "#3b82f6",
      icon: "📅",
      metrics: [
        { label: "Evenimente viitoare", value: String(upcoming.length) },
        { label: "Next important", value: nextThree[0]?.date.slice(5) ?? "—" },
        { label: "Tipuri", value: "6" },
        { label: "Actualizat", value: new Date().toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" }) },
      ],
    }),
    size
  );
}
