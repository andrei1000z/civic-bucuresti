import type { Metadata } from "next";
import { Scale } from "lucide-react";
import { ALL_COUNTIES } from "@/data/counties";
import { Badge } from "@/components/ui/Badge";
import { CompareCountyPicker } from "./CompareCountyPicker";

export const metadata: Metadata = {
  title: "Compară județele — side-by-side",
  description:
    "Vezi două județe din România comparate: sesizări, populație, accidente, calitate aer, BAC și mai multe. Folosește pentru cercetare sau curiozitate civică.",
  alternates: { canonical: "/compara" },
};

export const revalidate = 86400; // 1 day

export default function CompareLandingPage() {
  // Sort by population desc for default picks
  const sorted = [...ALL_COUNTIES].sort((a, b) => b.population - a.population);
  return (
    <div className="container-narrow py-12 md:py-16">
      <Badge className="mb-4">Instrument</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
        <Scale size={40} className="text-[var(--color-primary)]" />
        Compară județele
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Alege două județe și vezi cifrele lor alăturate: populație, sesizări civice,
        accidente rutiere, calitate aer, promovabilitate BAC și primarul în funcție.
        Un instrument util pentru jurnaliști, cercetători sau cetățeni curioși.
      </p>

      <CompareCountyPicker counties={sorted.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))} />
    </div>
  );
}
