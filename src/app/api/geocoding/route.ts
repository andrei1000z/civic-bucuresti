import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/sesizari/geocoding";

export const dynamic = "force-dynamic";
export const runtime = "edge"; // fast, global

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!lat || !lng) {
    return NextResponse.json({ error: "lat + lng required" }, { status: 400 });
  }
  const result = await reverseGeocode(lat, lng);
  return NextResponse.json({ data: result });
}
