import { getActiveInterruptions, getInterruptionsForCounty, toIcsCalendar } from "@/data/intreruperi";

export const revalidate = 1800;

/**
 * GET /api/intreruperi/ics        — întreg calendarul
 * GET /api/intreruperi/ics?county=CJ — doar județul respectiv
 *
 * Răspuns: text/calendar (ICS / iCalendar format).
 * Subscribe: pune linkul ăsta în Google Calendar → „Add calendar" → „From URL".
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const county = searchParams.get("county")?.toUpperCase();
  const items = county
    ? getInterruptionsForCounty(county)
    : getActiveInterruptions();
  const ics = toIcsCalendar(items);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="civia-intreruperi${county ? `-${county.toLowerCase()}` : ""}.ics"`,
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
