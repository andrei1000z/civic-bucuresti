import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COUNTY_SLUGS = new Set([
  "ab","ar","ag","bc","bh","bn","bt","br","bv","b","bz","cl","cs","cj","ct",
  "cv","db","dj","gl","gr","gj","hr","hd","il","is","if","mm","mh","ms","nt",
  "ot","ph","sj","sm","sb","sv","tr","tm","tl","vl","vs","vn",
]);

const COOKIE_NAME = "county";
const DEFAULT_COUNTY = "b";

const REDIRECT_EXACT = new Set([
  "/autoritati",
  "/bilete",
  "/istoric",
  "/cum-functioneaza",
  "/aer",
]);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!REDIRECT_EXACT.has(pathname)) return NextResponse.next();

  const savedCounty = request.cookies.get(COOKIE_NAME)?.value;
  const county = savedCounty && COUNTY_SLUGS.has(savedCounty) ? savedCounty : DEFAULT_COUNTY;

  const url = request.nextUrl.clone();
  url.pathname = `/${county}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/autoritati", "/bilete",
    "/istoric", "/cum-functioneaza", "/aer",
  ],
};
