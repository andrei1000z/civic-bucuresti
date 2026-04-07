import type { Metadata } from "next";
import { StiriList } from "@/components/stiri/StiriList";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Știri civice România",
  description: "Articole agregate din surse verificate: transport, urbanism, mediu, siguranță din toată România.",
  alternates: { canonical: "/stiri" },
};

export default function StiriPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Știri civice
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-4">
          Articole agregate și restructurate din surse verificate. Conținutul aparține publicațiilor originale.
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
