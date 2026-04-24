import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COUNTY_SLUGS = new Set([
  "ab","ar","ag","bc","bh","bn","bt","br","bv","b","bz","cl","cs","cj","ct",
  "cv","db","dj","gl","gr","gj","hr","hd","il","is","if","mm","mh","ms","nt",
  "ot","ph","sj","sm","sb","sv","tr","tm","tl","vl","vs","vn",
]);

const COOKIE_NAME = "county";
const DEFAULT_COUNTY = "b";

// Paths that only make sense county-scoped — redirect bare URL to the
// county-specific version. These pages DON'T have a national surface:
//   - /bilete: transport tickets are per-city (Bucharest has STB, Cluj has CTP)
//   - /istoric: historical mayors of a specific city
//   - /aer: live air quality is a per-county map
//
// NOTE: /autoritati was previously in this list but is now a NATIONAL
// catalog page (42 counties + 298 localities searchable). Leaving it
// in the redirect set would hide the national page from returning
// users. Keep per-county at /{slug}/autoritati (which still works).
const REDIRECT_EXACT = new Set([
  "/bilete",
  "/istoric",
  "/aer",
]);

// NOTĂ: /intreruperi NU e în REDIRECT_EXACT — e pagină națională agregată
// ca /autoritati. Versiunea per-județ există ca /{slug}/intreruperi și
// e accesibilă separat, dar bara de URL /intreruperi arată toate județele.

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Homepage "come home to your county" redirect ───────────────
  // If the user picked a county on a previous visit, bounce them
  // straight to `/{slug}` instead of re-showing the picker. Escape
  // hatches via `?switch=1` / `?home=1` (the Navbar "Schimbă județul"
  // link sends them here with ?switch=1).
  if (pathname === "/") {
    const url = request.nextUrl;
    if (url.searchParams.has("switch") || url.searchParams.has("home")) {
      return NextResponse.next();
    }
    const saved = request.cookies.get(COOKIE_NAME)?.value?.toLowerCase();
    if (saved && COUNTY_SLUGS.has(saved)) {
      const target = new URL(`/${saved}`, url);
      // Preserve UTM / other query params on the redirect
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
      return NextResponse.redirect(target, 307);
    }
    return NextResponse.next();
  }

  // ─── County-scoped path shortcuts ───────────────────────────────
  if (!REDIRECT_EXACT.has(pathname)) return NextResponse.next();

  const savedCounty = request.cookies.get(COOKIE_NAME)?.value;
  const county = savedCounty && COUNTY_SLUGS.has(savedCounty) ? savedCounty : DEFAULT_COUNTY;

  const url = request.nextUrl.clone();
  url.pathname = `/${county}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/",
    "/bilete",
    "/istoric",
    "/aer",
  ],
};
