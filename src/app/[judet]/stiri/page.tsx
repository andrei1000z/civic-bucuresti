import type { Metadata } from "next";
import { getCountyBySlug } from "@/data/counties";
import { StiriList } from "@/components/stiri/StiriList";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS } from "@/lib/constants";

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
    description: `Știri civice verificate relevante pentru ${county.name}: transport, urbanism, mediu, siguranță.`,
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

  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-3">
          Știri civice — {countyName}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-2">
          Articole agregate din surse verificate relevante pentru {countyName}. Conținutul aparține publicațiilor originale.
        </p>
        <p className="text-sm text-[var(--color-text-muted)] max-w-3xl mb-4 italic">
          Afișăm știri din toată România. Știrile specifice pentru {countyName} se actualizează la fiecare 4 ore.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SOURCE_COLORS).map(([source, color]) => (
            <Badge key={source} bgColor={color} color="white">
              {source}
            </Badge>
          ))}
        </div>
      </div>
      <StiriList />
    </div>
  );
}
