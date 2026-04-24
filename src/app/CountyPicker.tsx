"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Navigation, Loader2, Check, ArrowRight } from "lucide-react";
import { ALL_COUNTIES, getCountyById } from "@/data/counties";

/**
 * Find the closest county to given coordinates using Haversine distance.
 * This is a LOCAL fallback — no API call needed.
 */
function findClosestCounty(lat: number, lng: number) {
  let closest = ALL_COUNTIES[0]!;
  let minDist = Infinity;
  for (const c of ALL_COUNTIES) {
    const dLat = c.center[0] - lat;
    const dLng = c.center[1] - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDist) {
      minDist = dist;
      closest = c;
    }
  }
  return closest;
}

export function CountyPicker() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  // Read the saved county on mount — if present, the user is on the
  // homepage by explicit `?switch=1` (middleware would have redirected
  // them otherwise). Show a banner so they know which one they're
  // replacing + a shortcut to bail out and keep the current saved one.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("civia_county");
    if (raw) setSavedSlug(raw.toLowerCase());
  }, []);

  const savedCounty = savedSlug
    ? ALL_COUNTIES.find((c) => c.slug === savedSlug)
    : null;

  const filtered = query.length >= 1
    ? ALL_COUNTIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.id.toLowerCase().includes(query.toLowerCase()) ||
          c.slug.includes(query.toLowerCase())
      )
    : ALL_COUNTIES;

  const handleSelect = (slug: string) => {
    localStorage.setItem("civia_county", slug);
    document.cookie = `county=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.push(`/${slug}`);
  };

  // Persist the selection when the user clicks a real <Link>. The Link handles
  // navigation + prefetch; we just capture the side-effect of setting the county
  // before the navigation commits.
  const persist = (slug: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("civia_county", slug);
    // eslint-disable-next-line react-hooks/immutability -- cookie assignment is a side-effect on document, not a React value
    document.cookie = `county=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  // Prefetch the county route when the user hovers — gives instant navigation
  // on click even for counties outside the initial viewport (Next already
  // prefetches visible Links, this covers the rest).
  const prefetchOnHover = (slug: string) => {
    router.prefetch(`/${slug}`);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocația nu este disponibilă în acest browser.");
      return;
    }
    setDetecting(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Try Nominatim first for accuracy
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const j = await res.json();
          if (j.data?.countyCode) {
            const county = getCountyById(j.data.countyCode);
            if (county) {
              handleSelect(county.slug);
              return;
            }
          }
        } catch {
          // Nominatim failed — use local fallback
        }

        // Fallback: find closest county center from coordinates (instant, no API)
        const closest = findClosestCounty(latitude, longitude);
        handleSelect(closest.slug);
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("GPS refuzat. Alege județul manual din lista de mai jos.");
        } else if (err.code === err.TIMEOUT) {
          setGpsError("GPS timeout. Încearcă din nou sau alege manual.");
        } else {
          setGpsError("Nu am putut accesa GPS-ul. Alege manual.");
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <section className="py-10">
      <div className="container-narrow">
        {savedCounty && (
          <div className="max-w-xl mx-auto mb-6 flex flex-wrap items-center gap-3 bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 rounded-[12px] px-4 py-3">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <Check size={16} className="text-[var(--color-primary)] shrink-0" />
              <span className="truncate">
                Județ salvat:{" "}
                <strong className="text-[var(--color-primary)]">
                  {savedCounty.name}
                </strong>
              </span>
            </div>
            <Link
              href={`/${savedCounty.slug}`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] transition-colors ml-auto"
            >
              Mergi la {savedCounty.name} <ArrowRight size={12} />
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută județul tău..."
              className="w-full h-12 pl-10 pr-4 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <button
            onClick={handleGPS}
            disabled={detecting}
            className="h-12 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 inline-flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
          >
            {detecting ? (
              <><Loader2 size={16} className="animate-spin" /> Se detectează...</>
            ) : (
              <><Navigation size={16} /> Detectează automat</>
            )}
          </button>
        </div>

        {gpsError && (
          <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-4">
            {gpsError}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filtered.map((county) => (
            <Link
              key={county.id}
              href={`/${county.slug}`}
              prefetch
              onClick={() => persist(county.slug)}
              onMouseEnter={() => prefetchOnHover(county.slug)}
              onTouchStart={() => prefetchOnHover(county.slug)}
              className="group flex items-center gap-2 p-3 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)] transition-all text-left min-w-0"
            >
              <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-1.5 py-0.5 rounded shrink-0">
                {county.id}
              </span>
              <span className="text-sm font-medium truncate min-w-0 flex-1 group-hover:text-[var(--color-primary)] transition-colors">
                {county.name}
              </span>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && query && (
          <p className="text-center text-[var(--color-text-muted)] py-8">
            Niciun județ găsit pentru &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </section>
  );
}
