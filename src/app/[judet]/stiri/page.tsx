import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { StiriList } from "@/components/stiri/StiriList";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS, readableTextColor } from "@/lib/constants";
import { NATIONAL_SOURCES, LOCAL_SOURCES_BY_COUNTY } from "@/lib/stiri/sources";
import {
  CountyPageHero,
  COUNTY_HERO_GRADIENT,
} from "@/components/county/CountyPageHero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `Știri civice — ${county.name}`,
    description: `Știri naționale + locale pentru ${county.name}: transport, urbanism, mediu, siguranță.`,
    alternates: { canonical: `/${county.slug}/stiri` },
  };
}

export default async function StiriPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const localSources = LOCAL_SOURCES_BY_COUNTY[county.id] ?? [];
  const visibleSources = [...NATIONAL_SOURCES, ...localSources];

  return (
    <div className="container-narrow py-8 md:py-12">
      <CountyPageHero
        countyName={county.name}
        countyId={county.id}
        countySlug={county.slug}
        title="Știri civice"
        icon={Newspaper}
        gradient={COUNTY_HERO_GRADIENT.news}
        description={
          localSources.length > 0 ? (
            <>
              Surse <strong>naționale</strong> verificate + {localSources.length}{" "}
              {localSources.length === 1 ? "casă" : "case"} de știri locală
              {localSources.length === 1 ? "" : "e"} din {county.name}. Fiecare
              articol primește o sinteză AI structurată — citești esența în 30s.
            </>
          ) : (
            <>
              Surse <strong>naționale</strong> verificate. Casa de știri locală
              din {county.name} nu e încă în catalog — propune una din
              feedback-ul de la subsol.
            </>
          )
        }
        tagline={`${visibleSources.length} surse active · sinteza AI rulează la fiecare articol cu Llama 3.3 70B + post-processor de gramatică românească.`}
      >
        <div className="flex flex-wrap gap-1.5">
          {visibleSources.map((source) => (
            <Badge
              key={source}
              bgColor={SOURCE_COLORS[source] ?? "#64748b"}
              color={readableTextColor(SOURCE_COLORS[source] ?? "#64748b")}
              className="text-[10px]"
            >
              {source}
            </Badge>
          ))}
        </div>
      </CountyPageHero>

      <StiriList />
    </div>
  );
}
