import type { Metadata } from "next";
import { evenimente } from "@/data/evenimente";
import { Badge } from "@/components/ui/Badge";
import { EvenimenteFilter } from "@/components/evenimente/EvenimenteFilter";

export const metadata: Metadata = {
  title: "Evenimente majore — România",
  description: "Cronologia evenimentelor semnificative din România: accidente, incendii, inundații, cutremure, proteste — din 1989 până azi.",
  alternates: { canonical: "/evenimente" },
};

export default function EvenimentePage() {
  const sorted = [...evenimente].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-stone-900 to-zinc-950 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container-narrow relative z-10 py-16 md:py-20">
          <Badge className="mb-4 bg-white/10 text-white border border-white/20">
            📚 Arhivă cronologică
          </Badge>
          <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-3">
            Evenimentele care au marcat România
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {sorted.length} evenimente documentate din {new Date(sorted[sorted.length - 1]?.data ?? "1940").getFullYear()} până azi — accidente, incendii, inundații, cutremure și proteste.
          </p>
        </div>
      </section>

      {/* Events with filter */}
      <section className="py-12">
        <div className="container-narrow">
          <EvenimenteFilter evenimente={sorted} />
        </div>
      </section>
    </>
  );
}
