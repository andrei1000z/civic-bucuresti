import type { Metadata } from "next";
import { primari, consiliiGenerale } from "@/data/primari";
import { DurateMandateChart, CompozitieCGChart } from "@/components/charts/IstoricCharts";
import { IstoricInteractive } from "@/components/istoric/IstoricInteractive";

export const metadata: Metadata = {
  title: "Istoric administrație București",
  description: "Toți primarii Bucureștiului din 1989 până azi: realizări, controverse, proiecte. Interactiv.",
};

export default function IstoricPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-12">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Istoric administrație București
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Toți primarii generali ai Capitalei din 1990 până în prezent — realizările,
          controversele și proiectele. Click pe un primar pentru detalii, bifează ca să compari.
        </p>
      </div>

      {/* Charts overview */}
      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
            Durata mandatelor (ani)
          </h3>
          <DurateMandateChart />
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
            Compoziția politică a Consiliului General
          </h3>
          <CompozitieCGChart />
        </div>
      </div>

      {/* Interactive primari */}
      <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold mb-6">
        Primarii generali
      </h2>
      <IstoricInteractive primari={primari} />

      {/* Consilii Generale */}
      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold mb-8">
          Consilii Generale — compoziție pe mandate
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consiliiGenerale.map((cg) => (
            <div
              key={cg.perioada}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5"
            >
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-semibold">
                {cg.perioada}
              </p>
              <div className="flex h-3 rounded-full overflow-hidden mb-3">
                {cg.compozitie.map((comp) => (
                  <div
                    key={comp.partid}
                    style={{ width: `${comp.procent}%`, background: comp.culoare }}
                    title={`${comp.partid}: ${comp.procent}%`}
                  />
                ))}
              </div>
              <div className="space-y-1">
                {cg.compozitie.map((comp) => (
                  <div key={comp.partid} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: comp.culoare }}
                      />
                      <span>{comp.partid}</span>
                    </div>
                    <span className="font-medium">{comp.procent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
