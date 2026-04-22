import type { Metadata } from "next";
import Link from "next/link";
import { ALL_COUNTIES } from "@/data/counties";
import {
  PRIMARII,
  POLITIA_LOCALA_JUDET,
  getCityCount,
  getPolitiaLocalaCount,
} from "@/data/autoritati-contact";
import { AutoritatiSearch } from "./AutoritatiSearch";

export const metadata: Metadata = {
  title: "Autorități publice în România — Civia",
  description:
    "Catalog național cu date de contact verificate pentru primăriile și Poliția Locală din fiecare județ și oraș important. Trimite sesizarea ta la adresa corectă.",
  alternates: { canonical: "/autoritati" },
  openGraph: {
    title: "Autorități publice — Civia",
    description: "Contacte verificate: primării + Poliția Locală, toate județele + orașe importante.",
  },
};

export default function AutoritatiIndexPage() {
  const counties = [...ALL_COUNTIES].sort((a, b) =>
    a.name.localeCompare(b.name, "ro"),
  );
  const cityCount = getCityCount();
  const plCount = getPolitiaLocalaCount();

  // Build flat searchable list of all records (counties + cities)
  const rows = [
    ...counties.map((c) => ({
      kind: "judet" as const,
      id: c.id,
      slug: c.slug,
      name: c.name,
      countyName: c.name,
      hasPrimarie: Boolean(PRIMARII[c.id]?.email),
      hasPl: Boolean(POLITIA_LOCALA_JUDET[c.id]?.email),
      href: `/${c.slug}/autoritati`,
    })),
  ];

  return (
    <div className="container-narrow py-12 md:py-16">
      <header className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Autorități publice — România
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Catalog național cu date de contact verificate: primării, Poliție Locală,
          prefecturi. Trimite sesizarea la adresa corectă — fără ghiceli.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Județe acoperite" value={counties.length.toString()} />
        <Stat label="Primării verificate" value={Object.keys(PRIMARII).length.toString()} />
        <Stat label="Poliție Locală" value={plCount.toString()} />
        <Stat label="Orașe non-capitale" value={cityCount.toString()} />
      </div>

      <AutoritatiSearch rows={rows} />

      <section className="mt-12 bg-[var(--color-primary-soft)] rounded-[12px] p-6">
        <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
          Ai observat un email greșit?
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Autoritățile se schimbă — domenii expiră, adrese sunt migrate. Dacă un
          email din Civia bounce-uiește, spune-ne și corectăm în 24h.
        </p>
        <a
          href="https://github.com/andrei1000z/civic-bucuresti/issues/new?labels=autoritati"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline font-medium"
        >
          Deschide un issue pe GitHub →
        </a>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4">
      <div className="text-3xl font-bold text-[var(--color-primary)] font-[family-name:var(--font-sora)]">
        {value}
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

// Next 15: force static rendering since data is build-time
export const dynamic = "force-static";
