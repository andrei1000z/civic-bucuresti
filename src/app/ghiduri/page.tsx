import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { ghiduri } from "@/data/ghiduri";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Ghiduri pentru cetățeni",
  description: "Ghiduri complete pentru cetățeni: bicicletă, caniculă, cutremur, transport, sesizări.",
  alternates: { canonical: "/ghiduri" },
};

const dificultateMap = {
  usor: { label: "Ușor", variant: "success" as const },
  mediu: { label: "Mediu", variant: "warning" as const },
  avansat: { label: "Avansat", variant: "accent" as const },
};

export default function GhiduriPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-700 to-pink-800 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="container-narrow relative z-10 py-20 md:py-28">
          <Badge className="mb-4 bg-white/10 text-white border border-white/20">
            📚 Ghiduri practice
          </Badge>
          <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-6xl font-bold mb-4">
            Ghiduri pentru cetățeni
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl">
            Informații clare, structurate și verificate pentru a naviga mai ușor prin orașul tău — de la bicicletă la cutremur.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ghiduri.map((ghid) => (
              <Link
                key={ghid.id}
                href={`/ghiduri/${ghid.slug}`}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all"
              >
                <div className={`relative h-48 bg-gradient-to-br ${ghid.gradient} overflow-hidden`}>
                  {ghid.image && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/ghiduri/${ghid.image}.webp`}
                        alt={ghid.titlu}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      {ghid.icon}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={dificultateMap[ghid.dificultate].variant}>
                      {dificultateMap[ghid.dificultate].label}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Clock size={12} />
                      {ghid.timpCitire} min
                    </span>
                  </div>
                  <h3 className="font-[family-name:var(--font-sora)] font-semibold text-xl mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {ghid.titlu}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-3">
                    {ghid.descriere}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                    <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <BookOpen size={14} />
                      {ghid.capitole} capitole
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] group-hover:gap-2 transition-all">
                      Citește
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
