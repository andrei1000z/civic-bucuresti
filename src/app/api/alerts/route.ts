import { NextResponse } from "next/server";

export const revalidate = 300; // 5 minutes

interface AlertPayload {
  id: string;
  type: "aqi" | "meteo" | "ro-alert" | "info";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  link?: string;
  source: string;
  validUntil?: string;
}

/**
 * Aggregates active public alerts into a single response consumed by
 * the sticky <AlertBanner /> in the root layout.
 *
 * Sources currently checked:
 *   1. AQI — if the highest sensor reading in București exceeds AQI 150, emit a critical alert
 *   2. Editorial — announcements set via env var CIVIA_ANNOUNCEMENT
 *
 * Strategy: the first alert that fires (in priority order) is returned.
 * All sources fail-open — a 5xx from any external API results in null.
 */
export async function GET() {
  const alerts: AlertPayload[] = [];

  // 1. AQI — query our own aggregator
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/aer?county=B`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const { data } = (await res.json()) as {
        data: { sensors?: Array<{ aqi: number }> };
      };
      if (data?.sensors && data.sensors.length > 0) {
        const maxAqi = Math.max(...data.sensors.map((s) => s.aqi ?? 0));
        if (maxAqi >= 150) {
          alerts.push({
            id: `aqi-${Math.floor(maxAqi / 25) * 25}-${new Date().toISOString().slice(0, 10)}`,
            type: "aqi",
            severity: maxAqi >= 200 ? "critical" : "warning",
            title: maxAqi >= 200 ? "Poluare periculoasă" : "Calitate aer redusă",
            message: `AQI ${Math.round(maxAqi)} în București — evită efortul fizic în exterior și închide ferestrele.`,
            link: "/aer",
            source: "OpenAQ / Sensor Community",
            validUntil: new Date(Date.now() + 6 * 60 * 60_000).toISOString(),
          });
        }
      }
    }
  } catch {
    /* best-effort */
  }

  // 2. Editorial announcements — simple env-var based
  // Format: "SEVERITY|TITLE|MESSAGE|LINK"
  const announcement = process.env.CIVIA_ANNOUNCEMENT;
  if (announcement) {
    const parts = announcement.split("|");
    if (parts.length >= 3) {
      alerts.push({
        id: `editorial-${Buffer.from(announcement).toString("base64").slice(0, 12)}`,
        type: "info",
        severity: (parts[0] as AlertPayload["severity"]) ?? "info",
        title: parts[1] ?? "Anunț",
        message: parts[2] ?? "",
        link: parts[3] || undefined,
        source: "Civia",
      });
    }
  }

  alerts.sort((a, b) => {
    const order = { critical: 3, warning: 2, info: 1 };
    return order[b.severity] - order[a.severity];
  });

  return NextResponse.json(
    { data: alerts[0] ?? null },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
