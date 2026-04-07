import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_COUNTIES, getCountyBySlug } from "@/data/counties";
import { CountyProvider } from "@/lib/county-context";

export async function generateStaticParams() {
  return ALL_COUNTIES.map((c) => ({ judet: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: { default: `${county.name} — Civia`, template: `%s — ${county.name} — Civia` },
    description: `Sesizări, calitate aer, hărți și ghiduri civice pentru județul ${county.name}.`,
    alternates: { canonical: `/${county.slug}` },
  };
}

export default async function CountyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const countyInfo = {
    id: county.id,
    name: county.name,
    slug: county.slug,
    center: [...county.center] as [number, number],
  };

  return <CountyProvider county={countyInfo}>{children}</CountyProvider>;
}
