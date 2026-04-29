import type { Metadata } from "next";
import { getCountyBySlug } from "@/data/counties";
import { StiriList } from "@/components/stiri/StiriList";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS } from "@/lib/constants";
import { NATIONAL_SOURCES, LOCAL_SOURCES_BY_COUNTY } from "@/lib/stiri/sources";

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
  const countyName = county?.name ?? judet;
  const localSources = county ? LOCAL_SOURCES_BY_COUNTY[county.id] ?? [] : [];
  const visibleSources = [...NATIONAL_SOURCES, ...localSources];

  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-3">
          Știri civice — {countyName}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-2">
          {localSources.length > 0 ? (
            <>
              Surse <strong>naționale</strong> + <strong>{localSources.length === 1 ? "casa" : "casele"} de știri locală{localSources.length === 1 ? "" : "e"}</strong> din {countyName}.
            </>
          ) : (
            <>
              Surse <strong>naționale</strong> verificate. Casa de știri locală din {countyName} nu e încă în catalog — propune una pe email sau în feedback.
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {visibleSources.map((source) => (
            <Badge key={source} bgColor={SOURCE_COLORS[source] ?? "#64748b"} color="white">
              {source}
            </Badge>
          ))}
        </div>
      </div>
      <StiriList />
    </div>
  );
}
