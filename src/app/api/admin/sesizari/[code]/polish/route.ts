import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { polishSesizare } from "@/lib/sesizari/polish";
import { forwardGeocode } from "@/lib/sesizari/geocoding";
import { invalidateSesizariCache } from "@/lib/cached-queries";
import { rateLimitAsync } from "@/lib/ratelimit";

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

  // Polish calls Groq + Nominatim, so even an admin-authenticated
  // endpoint deserves a ceiling. 30/min per admin is plenty for
  // moderating a queue, but stops a runaway loop from burning through
  // AI quota or tripping Nominatim's 1 req/s ban.
  const rl = await rateLimitAsync(`admin-polish:${user.id}`, { limit: 30, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe polish-uri rapide. Așteaptă un minut." },
      { status: 429 }
    );
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

  // Admin explicitly asked to polish — ALWAYS trust the forward-geocode
  // result when it succeeds. No "close enough" threshold: the whole
  // point of clicking sparkle is "this pin is wrong, fix it". The
  // author's GPS was probably their couch, the real problem is 3-5 km
  // away, and we shouldn't second-guess the admin.
  let newLat = sesizare.lat;
  let newLng = sesizare.lng;
  let geocodeNote: string | null = null;
  try {
    // Pass the sesizare's county NAME (not code) so the extractor can
    // scope fallback queries to the right city — a Bucharest-scoped
    // extractor running on a Cluj sesizare would otherwise move the
    // pin 400 km off.
    const { getCountyById } = await import("@/data/counties");
    const countyObj = sesizare.county ? getCountyById(sesizare.county) : null;
    const countyHint = countyObj?.name ?? null;
    const hit = await forwardGeocode(polished.locatie, countyHint);
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
      newLat = hit.lat;
      newLng = hit.lng;
      geocodeNote =
        distKm < 0.05
          ? "coords confirmed (already matched location text)"
          : `coords moved ${distKm.toFixed(1)} km to match location text`;
    } else {
      geocodeNote = "Nominatim nu a găsit adresa — coordonatele rămân neschimbate";
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
      // Surface AI health so the admin diff modal can distinguish
      // "already clean" (AI ran, nothing to improve) from "AI call
      // actually failed and we fell back to the raw input".
      aiSucceeded: polished.aiSucceeded,
      aiError: polished.error ?? null,
      // Include the pre-polish snapshot so the admin UI can show a
      // side-by-side diff without needing another round-trip.
      before: {
        titlu: sesizare.titlu,
        descriere: sesizare.descriere,
        locatie: sesizare.locatie,
        lat: sesizare.lat,
        lng: sesizare.lng,
      },
    },
  });
}
