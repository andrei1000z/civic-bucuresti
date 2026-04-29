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
    title: `Transport public — ${county.name}`,
    description: `Linii de transport public (metrou, tramvai, autobuz) în ${county.name}.`,
    alternates: { canonical: `/${county.slug}/harti/transport` },
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
      <h1 className="sr-only">Transport public {county.name}</h1>
      <HartiMap
        defaultTab="transport"
        center={[...county.center] as [number, number]}
        zoom={county.id === "B" ? 12 : 11}
        scopeName={county.name}
        countySlug={county.slug}
      />
    </>
  );
}
