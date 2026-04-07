import type { Metadata } from "next";
import { getCountyBySlug } from "@/data/counties";
import { HartiMap } from "@/components/maps/HartiMap";
import { CountyMapPlaceholder } from "@/components/maps/CountyMapPlaceholder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: "Hărți de mobilitate",
    description: `Hartă interactivă cu infrastructura de mobilitate în ${county.name}.`,
    alternates: { canonical: `/${county.slug}/harti` },
  };
}

export default async function HartiPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  const isBucuresti = county?.id === "B";

  if (isBucuresti) {
    return (
      <>
        <h1 className="sr-only">Hărți de mobilitate București — piste, metrou, STB, trasee</h1>
        <HartiMap />
      </>
    );
  }

  return (
    <>
      <h1 className="sr-only">Hărți de mobilitate {county?.name} — infrastructură, trasee</h1>
      <CountyMapPlaceholder
        countyName={county?.name ?? judet}
        center={county ? ([...county.center] as [number, number]) : [45.94, 24.97]}
      />
    </>
  );
}
