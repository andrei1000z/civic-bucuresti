import { getInterruptionById, toIcsVEvent } from "@/data/intreruperi";
import { NextResponse } from "next/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const revalidate = 3600;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`intreruperi-ics-one:${ip}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return new Response("Rate limit", { status: 429 });
  }

  const { id } = await params;
  const item = getInterruptionById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Civia//Intreruperi//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${item.provider} — ${item.reason.slice(0, 40)}`,
    "X-WR-TIMEZONE:Europe/Bucharest",
    toIcsVEvent(item),
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${item.id}.ics"`,
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}
