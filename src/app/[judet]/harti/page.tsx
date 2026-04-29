import type { Metadata } from "next";
import { getCountyBySlug } from "@/data/counties";
import { HartiMap } from "@/components/maps/HartiMap";

// Shell static — Leaflet face client-side fetch. ISR 24h.
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `Hărți mobilitate — ${county.name}`,
    description: `Hartă interactivă cu piste de biciclete, transport public și infrastructură în ${county.name}. Date OpenStreetMap.`,
    alternates: { canonical: `/${county.slug}/harti` },
  };
}

// Per-county initial zoom. Bucharest is dense enough for city-level
// (z12); the rest default to z10 which shows the county seat + a bit
// of surrounding area. The map is free-pan after load, so these are
// just opinionated defaults.
const COUNTY_ZOOM: Record<string, number> = {
  B: 12,
};
const DEFAULT_COUNTY_ZOOM = 10;

export default async function HartiPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return null;

  const zoom = COUNTY_ZOOM[county.id] ?? DEFAULT_COUNTY_ZOOM;

  return (
    <>
      <h1 className="sr-only">
        Hărți de mobilitate {county.name} — piste biciclete, transport, trasee
      </h1>
      <HartiMap
        center={[...county.center] as [number, number]}
        zoom={zoom}
        scopeName={county.name}
        countySlug={county.slug}
      />
    </>
  );
}
