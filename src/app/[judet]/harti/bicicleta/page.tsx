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
    title: `Piste biciclete — ${county.name}`,
    description: `Piste de biciclete și benzi marcate din ${county.name}. Date OpenStreetMap, actualizate lunar.`,
    alternates: { canonical: `/${county.slug}/harti/bicicleta` },
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
      <h1 className="sr-only">Piste de biciclete {county.name}</h1>
      <HartiMap
        defaultTab="bicicleta"
        center={[...county.center] as [number, number]}
        zoom={county.id === "B" ? 12 : 10}
        scopeName={county.name}
        countySlug={county.slug}
      />
    </>
  );
}
