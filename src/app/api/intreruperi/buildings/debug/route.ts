import { NextResponse } from "next/server";
import {
  getBuildingsForOutage,
  getCachedBuildings,
} from "@/lib/intreruperi/buildings";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  const lat = 44.4419;
  const lng = 26.099;
  const id = "pmb-magheru-asfaltare";
  const radiusM = 200;

  const t0 = Date.now();
  const cached = await getCachedBuildings(id);
  const t1 = Date.now();

  let fresh: unknown[] = [];
  let freshError: string | null = null;
  let freshMs = 0;
  if (!cached) {
    try {
      const t2 = Date.now();
      fresh = await getBuildingsForOutage(id, lat, lng, radiusM);
      freshMs = Date.now() - t2;
    } catch (e) {
      freshError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    }
  }

  return NextResponse.json({
    id,
    cached: cached ? cached.length : null,
    cacheReadMs: t1 - t0,
    fresh: Array.isArray(fresh) ? fresh.length : null,
    freshSampleTags:
      Array.isArray(fresh) && fresh.length > 0
        ? (fresh as Array<{ tags?: unknown }>).slice(0, 3).map((p) => p.tags ?? null)
        : [],
    freshMs,
    freshError,
  });
}
