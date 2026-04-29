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
    title: `Hartă rutieră — ${county.name}`,
    description: `Autostrăzi, drumuri naționale și rutare în ${county.name}. Date OpenStreetMap.`,
    alternates: { canonical: `/${county.slug}/harti/cumasina` },
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
      <h1 className="sr-only">Rutare auto {county.name}</h1>
      <HartiMap
        defaultTab="auto"
        center={[...county.center] as [number, number]}
        zoom={county.id === "B" ? 12 : 10}
        scopeName={county.name}
        countySlug={county.slug}
      />
    </>
  );
}
