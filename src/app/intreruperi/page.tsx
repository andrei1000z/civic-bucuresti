import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  ExternalLink,
  Rss,
  Download,
} from "lucide-react";
import {
  getActiveInterruptions,
  TYPE_ICONS,
  TYPE_LABELS,
} from "@/data/intreruperi";
import { SITE_URL } from "@/lib/constants";
import { IntreruperiFilters } from "./IntreruperiFilters";

export const metadata: Metadata = {
  title: "Întreruperi programate — apă, caldură, gaz, curent, lucrări stradă",
  description:
    "Află din timp când se taie apa, caldura, gazul sau curentul în orașul tău + lucrările de stradă în desfășurare. Catalogate din surse oficiale (Apa Nova, Termoenergetica, Distrigaz, E-Distribuție, PMB).",
  alternates: {
    canonical: "/intreruperi",
    types: {
      "application/rss+xml": [
        { url: "/intreruperi/rss", title: "Întreruperi Civia RSS" },
      ],
      "text/calendar": [
        { url: "/api/intreruperi/ics", title: "Calendar iCalendar" },
      ],
    },
  },
  openGraph: {
    title: "Întreruperi programate — Civia",
    description:
      "Nu mai afla din baie că „s-a oprit iar apa”. Vezi în avans toate întreruperile programate + lucrările la stradă.",
    type: "website",
    locale: "ro_RO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Întreruperi programate — Civia",
    description: "Apă, caldură, gaz, curent + lucrări de stradă. Subscribe RSS sau iCal.",
  },
  keywords: [
    "întreruperi apă",
    "întreruperi caldură",
    "lucrări stradă București",
    "Apa Nova",
    "Termoenergetica",
    "avarie apă",
    "programare lucrări",
  ],
};

export const revalidate = 1800; // 30 min — seed static deocamdată, scraper vine în v2

export default function IntreruperiPage() {
  const all = getActiveInterruptions();

  // Dataset JSON-LD pentru Google (catalog utilitar)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Întreruperi programate România",
    description:
      "Date de contact pentru întreruperi programate de apă, caldură, gaz, curent + lucrări la stradă, agregate din surse oficiale.",
    url: `${SITE_URL}/intreruperi`,
    keywords: [
      "întreruperi apă",
      "întreruperi caldură",
      "lucrări stradă",
      "Apa Nova",
      "Termoenergetica",
    ],
    creator: { "@type": "Organization", name: "Civia", url: SITE_URL },
    spatialCoverage: { "@type": "Country", name: "Romania" },
  };

  return (
    <div className="container-narrow py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-4">
          <AlertTriangle size={12} /> În test — scraper live în v2
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-5xl font-bold mb-3">
          Întreruperi programate
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
          Află din timp când ți se oprește apa, caldura, gazul sau curentul +
          lucrările de stradă în curs. Agregat din surse oficiale (Apa Nova,
          Termoenergetica, Distrigaz, E-Distribuție, PMB, RADP).
        </p>
      </header>

      {/* Stats quick */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {(["apa", "caldura", "gaz", "electricitate"] as const).map((t) => {
          const count = all.filter((i) => i.type === t).length;
          return (
            <div
              key={t}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4"
            >
              <div className="text-2xl mb-1">{TYPE_ICONS[t]}</div>
              <div className="text-2xl font-bold text-[var(--color-primary)] font-[family-name:var(--font-sora)]">
                {count}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {TYPE_LABELS[t]} active
              </div>
            </div>
          );
        })}
      </div>

      {all.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] p-8 text-center">
          <Calendar
            size={40}
            className="mx-auto mb-3 text-[var(--color-text-muted)]"
          />
          <h2 className="font-semibold text-lg mb-1">
            Nicio întrerupere în catalog momentan
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Reîncarcă în câteva ore — catalogul se actualizează periodic.
          </p>
        </div>
      ) : (
        <IntreruperiFilters items={all} />
      )}

      {/* Subscribe bar — ICS + RSS + API */}
      <section className="mt-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar size={16} /> Rămâi la curent automat
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
          Nu mai verifica manual. Subscribe la calendar sau RSS — actualizate
          la 30 minute.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <a
            href="/api/intreruperi/ics"
            download="civia-intreruperi.ics"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[8px] bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors justify-center"
          >
            <Download size={14} /> Calendar (ICS)
          </a>
          <a
            href="/intreruperi/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[8px] bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors justify-center"
          >
            <Rss size={14} /> Flux RSS
          </a>
          <a
            href="/api/intreruperi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-bg)] transition-colors justify-center"
          >
            <ExternalLink size={14} /> JSON API
          </a>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">
          <strong>Subscribe în Google Calendar:</strong> Add calendar → From URL
          → <code className="text-[11px]">https://civia.ro/api/intreruperi/ics</code>
        </p>
      </section>

      <section className="mt-6 bg-[var(--color-primary-soft)] rounded-[12px] p-6">
        <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2 flex items-center gap-2">
          <MapPin size={18} /> Surse oficiale
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Fiecare întrerupere provine dintr-un anunț public al unuia dintre
          operatorii de mai jos. Click să mergi la pagina lor originală.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <li>
            <a
              href="https://www.apanovabucuresti.ro/intreruperi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
            >
              <ExternalLink size={12} /> Apa Nova București
            </a>
          </li>
          <li>
            <a
              href="https://www.termoenergetica.ro/lista-avarii"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
            >
              <ExternalLink size={12} /> Termoenergetica
            </a>
          </li>
          <li>
            <a
              href="https://distrigazsud-retele.ro/avarii"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
            >
              <ExternalLink size={12} /> Distrigaz Sud Rețele
            </a>
          </li>
          <li>
            <a
              href="https://sesizari.edistributie.com/harta-avarii"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
            >
              <ExternalLink size={12} /> E-Distribuție Muntenia
            </a>
          </li>
        </ul>
        <p className="text-xs text-[var(--color-text-muted)] mt-4">
          Vrei să adăugăm mai multe surse (Apavital Iași, RAJA, Aquatim, Colterm,
          etc.)?{" "}
          <Link
            href="https://github.com/andrei1000z/civic-bucuresti/issues"
            target="_blank"
            className="text-[var(--color-primary)] hover:underline"
          >
            Deschide issue
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
