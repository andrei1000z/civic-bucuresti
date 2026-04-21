import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { polishSesizare } from "@/lib/sesizari/polish";
import { forwardGeocode } from "@/lib/sesizari/geocoding";
import { invalidateSesizariCache } from "@/lib/cached-queries";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// POST /api/admin/sesizari/[code]/polish
// Admin-only. Rewrites title + descriere + locatie with AI, re-forward-
// geocodes the polished location text, and updates the row. Use this to
// clean up legacy sesizări submitted before the create route started
// polishing automatically, or to re-run the polish on anything that still
// looks rough.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { code } = await params;
  const sesizare = await getSesizareByCode(code);
  if (!sesizare) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const polished = await polishSesizare({
    titlu: sesizare.titlu,
    descriere: sesizare.descriere,
    locatie: sesizare.locatie,
    tip: sesizare.tip,
  });

  // Re-forward-geocode. If the stored coords are close to the geocoded
  // hit (<5 km) we keep them — GPS is usually more precise than a text
  // search. If they're wildly off (>10 km) we trust the text.
  let newLat = sesizare.lat;
  let newLng = sesizare.lng;
  let geocodeNote: string | null = null;
  try {
    const hit = await forwardGeocode(polished.locatie);
    if (hit) {
      const R = 6371;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(hit.lat - sesizare.lat);
      const dLng = toRad(hit.lng - sesizare.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(sesizare.lat)) *
          Math.cos(toRad(hit.lat)) *
          Math.sin(dLng / 2) ** 2;
      const distKm = 2 * R * Math.asin(Math.sqrt(a));
      if (distKm > 10) {
        newLat = hit.lat;
        newLng = hit.lng;
        geocodeNote = `coords moved ${distKm.toFixed(1)} km to match location text`;
      }
    }
  } catch { /* keep original */ }

  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from("sesizari")
    .update({
      titlu: polished.titlu,
      descriere: polished.descriere,
      locatie: polished.locatie,
      lat: newLat,
      lng: newLng,
    })
    .eq("id", sesizare.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidateSesizariCache();

  return NextResponse.json({
    ok: true,
    data: {
      titlu: polished.titlu,
      descriere: polished.descriere,
      locatie: polished.locatie,
      lat: newLat,
      lng: newLng,
      geocodeNote,
    },
  });
}
