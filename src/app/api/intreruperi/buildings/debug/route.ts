import { NextResponse } from "next/server";

// Temporary debug endpoint — probes each Overpass mirror separately
// for a hardcoded Magheru location and reports HTTP status + element
// count + remark, so we can see why production is returning 0
// buildings while local curl gets a full result set.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

export async function GET() {
  const ql = `[out:json][timeout:20];(way["building"](around:200,44.4419,26.099););out geom 50;`;
  const results: Array<Record<string, unknown>> = [];

  for (const url of MIRRORS) {
    const start = Date.now();
    const out: Record<string, unknown> = { mirror: new URL(url).hostname };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Civia/1.0 (civia.ro)",
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(ql)}`,
        signal: AbortSignal.timeout(45_000),
      });
      out.status = res.status;
      out.contentType = res.headers.get("content-type") ?? null;
      out.timeMs = Date.now() - start;
      if (res.ok) {
        const text = await res.text();
        out.bodyLen = text.length;
        try {
          const data = JSON.parse(text) as { elements?: unknown[]; remark?: string };
          out.elementCount = Array.isArray(data.elements) ? data.elements.length : 0;
          out.remark = data.remark ?? null;
          out.firstElementSample =
            Array.isArray(data.elements) && data.elements.length > 0
              ? (data.elements[0] as { type?: unknown; tags?: unknown }).type ?? null
              : null;
        } catch (e) {
          out.parseError = e instanceof Error ? e.message : String(e);
          out.bodySample = text.slice(0, 200);
        }
      } else {
        const text = await res.text();
        out.bodySample = text.slice(0, 200);
      }
    } catch (e) {
      out.timeMs = Date.now() - start;
      out.fetchError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    }
    results.push(out);
  }

  return NextResponse.json({ ql, results });
}
