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
    title: `Hartă pietonală — ${county.name}`,
    description: `Parcuri, zone pietonale și trotuare din ${county.name}. Date OpenStreetMap.`,
    alternates: { canonical: `/${county.slug}/harti/pejos` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return null;

  return (
    <>
      <h1 className="sr-only">Zone pietonale {county.name}</h1>
      <HartiMap
        defaultTab="pejos"
        center={[...county.center] as [number, number]}
        zoom={county.id === "B" ? 12 : 10}
        scopeName={county.name}
        countySlug={county.slug}
      />
    </>
  );
}
