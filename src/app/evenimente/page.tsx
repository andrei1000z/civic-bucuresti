import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Droplets, Zap, Users as UsersIcon, Building2, Car, ArrowRight } from "lucide-react";
import { evenimente } from "@/data/evenimente";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { EvenimentCategory, EvenimentSeverity } from "@/types";

export const metadata: Metadata = {
  title: "Evenimente majore",
  description: "Cronologia incidentelor și evenimentelor semnificative din România.",
  alternates: { canonical: "/evenimente" },
};

const categoryIcons: Record<EvenimentCategory, React.ElementType> = {
  accident: Car,
  incendiu: Flame,
  inundatie: Droplets,
  cutremur: Zap,
  protest: UsersIcon,
  infrastructura: Building2,
};

const categoryLabels: Record<EvenimentCategory, string> = {
  accident: "Accident",
  incendiu: "Incendiu",
  inundatie: "Inundații",
  cutremur: "Cutremur",
  protest: "Protest",
  infrastructura: "Infrastructură",
};

const severityColors: Record<EvenimentSeverity, string> = {
  minor: "#84CC16",
  moderat: "#EAB308",
  major: "#F97316",
  critic: "#DC2626",
};

const severityLabels: Record<EvenimentSeverity, string> = {
  minor: "Minor",
  moderat: "Moderat",
  major: "Major",
  critic: "Critic",
};

export default function EvenimentePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-stone-900 to-zinc-950 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container-narrow relative z-10 py-16 md:py-20">
          <Badge className="mb-4 bg-white/10 text-white border border-white/20">
            📚 Arhivă cronologică
          </Badge>
          <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
            Evenimentele care au marcat România
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Accidente, incendii, inundații, cutremure și proteste — o arhivă documentată a
            incidentelor importante din istoria modernă a Capitalei.
          </p>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="py-16">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evenimente.map((ev) => {
              const Icon = categoryIcons[ev.category];
              return (
                <Link
                  key={ev.id}
                  href={`/evenimente/${ev.slug}`}
                  className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all"
                >
                  <div className={`relative h-48 bg-gradient-to-br ${ev.gradient} overflow-hidden`}>
                    {ev.image ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/images/evenimente/${ev.image}.webp`}
                          alt={ev.titlu}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                        <Icon size={72} strokeWidth={1.2} className="text-white/50 relative z-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge bgColor="rgba(0,0,0,0.5)" color="white">
                        {categoryLabels[ev.category]}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 z-10">
                      <Badge
                        bgColor={severityColors[ev.severity]}
                        color="white"
                      >
                        {severityLabels[ev.severity]}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                      {formatDate(ev.data)}
                    </p>
                    <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {ev.titlu}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">
                      {ev.descriere}
                    </p>
                    {(ev.victime !== undefined || ev.evacuati !== undefined || ev.echipaje !== undefined) && (
                      <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)]">
                        {ev.victime !== undefined && ev.victime > 0 && (
                          <span>{ev.victime} victime</span>
                        )}
                        {ev.evacuati !== undefined && ev.evacuati > 0 && (
                          <span>{ev.evacuati} evacuați</span>
                        )}
                        {ev.echipaje !== undefined && ev.echipaje > 0 && (
                          <span>{ev.echipaje} echipaje</span>
                        )}
                        <span className="ml-auto flex items-center gap-1 text-[var(--color-primary)] font-medium group-hover:gap-2 transition-all">
                          Detalii <ArrowRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
