import type { Metadata } from "next";
import { Newspaper, Sparkles } from "lucide-react";
import { StiriList } from "@/components/stiri/StiriList";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS, SITE_URL } from "@/lib/constants";
import { CollectionPageJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Știri civice România",
  description:
    "Articole agregate din surse verificate: transport, urbanism, mediu, siguranță din toată România.",
  alternates: { canonical: "/stiri" },
};

const NATIONAL_SOURCES = ["Digi24", "Hotnews", "G4Media", "Mediafax", "News.ro"] as const;

export default function StiriPage() {
  return (
    <div className="container-narrow py-8 md:py-12">
      <CollectionPageJsonLd
        name="Știri civice — Civia"
        description="Catalog de știri agregate din surse verificate (Digi24, HotNews, B365, G4Media, Mediafax, News.ro și ziare locale): transport, urbanism, mediu, siguranță."
        url={`${SITE_URL}/stiri`}
      />

      {/* Hero — same gradient pattern as the rest of Civia, but tinted
          slate-blue so the news surface reads as informational rather
          than action-oriented. */}
      <header className="relative mb-8 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-900 p-6 md:p-8 text-white shadow-[var(--shadow-3)]">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-8 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-[var(--radius-xs)] bg-white/15 backdrop-blur-sm ring-2 ring-white/30 grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <Newspaper size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-sora)] text-2xl md:text-4xl font-extrabold leading-tight mb-2">
              Știri civice
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-2xl">
              Doar surse <strong>naționale</strong> verificate — Digi24, HotNews, G4Media,
              Mediafax, News.ro. Pentru știri locale, deschide pagina județului tău.
            </p>
            <p className="text-[11px] text-white/70 mt-3 inline-flex items-center gap-1.5">
              <Sparkles size={11} aria-hidden="true" />
              Fiecare articol primește o sinteză AI structurată — citești esența în 30s.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {NATIONAL_SOURCES.map((source) => (
                <Badge
                  key={source}
                  bgColor={SOURCE_COLORS[source] ?? "#64748b"}
                  color="white"
                  className="text-[10px]"
                >
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </header>

      <StiriList />
    </div>
  );
}
