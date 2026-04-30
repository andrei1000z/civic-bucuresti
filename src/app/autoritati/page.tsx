import type { Metadata } from "next";
import { ALL_COUNTIES } from "@/data/counties";
import {
  PRIMARII,
  POLITIA_LOCALA_JUDET,
  ORASE_IMPORTANTE,
  getCityCount,
  getPolitiaLocalaCount,
} from "@/data/autoritati-contact";
import { SITE_URL } from "@/lib/constants";
import { AutoritatiSearch, type Row } from "./AutoritatiSearch";
import { GovernmentOrganizationJsonLd } from "@/components/JsonLd";
import { PageHero, HERO_GRADIENT } from "@/components/layout/PageHero";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Autorități publice în România — Civia",
  description:
    "Catalog național cu date de contact verificate pentru primăriile și Poliția Locală din fiecare județ și oraș important. Trimite sesizarea ta la adresa corectă.",
  alternates: { canonical: "/autoritati" },
  openGraph: {
    title: "Autorități publice — Civia",
    description: "Contacte verificate: primării + Poliția Locală, toate județele + 298 localități.",
    type: "website",
    locale: "ro_RO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autorități publice — 298 primării verificate",
    description: "Catalog național cu emailuri + telefoane. Trimite sesizarea la adresa corectă.",
  },
  keywords: [
    "primării România",
    "Poliția Locală",
    "prefecturi",
    "contacte autorități",
    "email primărie",
  ],
};

export default function AutoritatiIndexPage() {
  const counties = [...ALL_COUNTIES].sort((a, b) =>
    a.name.localeCompare(b.name, "ro"),
  );
  const cityCount = getCityCount();
  const plCount = getPolitiaLocalaCount();

  // Build flat searchable list of all records (counties + cities)
  const countyRows: Row[] = counties.map((c) => {
    const p = PRIMARII[c.id];
    const pl = POLITIA_LOCALA_JUDET[c.id];
    return {
      kind: "judet",
      id: c.id,
      slug: c.slug,
      name: c.name,
      countyName: c.name,
      ...(p?.email ? { primarieEmail: p.email } : {}),
      ...(p?.phone ? { primariePhone: p.phone } : {}),
      ...(pl?.email ? { plEmail: pl.email } : {}),
      ...(pl?.phone ? { plPhone: pl.phone } : {}),
      href: `/${c.slug}/autoritati`,
    };
  });

  // Non-capital cities — searchable independently
  const cityRows: Row[] = Object.entries(ORASE_IMPORTANTE).map(([slug, city]) => {
    const county = ALL_COUNTIES.find((c) => c.id === city.countyCode);
    return {
      kind: "oras",
      id: slug,
      slug,
      name: city.name,
      countyName: county?.name ?? city.countyCode,
      ...(city.email ? { primarieEmail: city.email } : {}),
      ...(city.phone ? { primariePhone: city.phone } : {}),
      ...(city.politieLocala?.email ? { plEmail: city.politieLocala.email } : {}),
      ...(city.politieLocala?.phone ? { plPhone: city.politieLocala.phone } : {}),
      href: county ? `/${county.slug}/autoritati#${slug}` : `/autoritati`,
    };
  });

  // Judete first (primary surface), cities after
  const rows: Row[] = [...countyRows, ...cityRows];

  // schema.org Dataset — helps Google surface this as a data catalog
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Autorități publice — România",
    description:
      "Date de contact verificate pentru primăriile, Poliția Locală și prefecturile din toate județele României, plus orașele non-capitale.",
    url: `${SITE_URL}/autoritati`,
    keywords: [
      "primării România",
      "Poliția Locală",
      "prefecturi",
      "contacte autorități",
      "sesizări civice",
    ],
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    creator: {
      "@type": "Organization",
      name: "Civia",
      url: SITE_URL,
    },
    spatialCoverage: {
      "@type": "Country",
      name: "Romania",
    },
  };

  return (
    <div className="container-narrow py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GovernmentOrganizationJsonLd
        name="Catalog autorități publice — Civia"
        description="Date de contact verificate pentru primăriile, Poliția Locală și prefecturile din România. 42 județe + 298 localități."
        url={`${SITE_URL}/autoritati`}
        areaServed="România"
      />
      <PageHero
        title="Autorități publice — România"
        icon={Building2}
        gradient={HERO_GRADIENT.authority}
        description="Catalog național cu date de contact verificate: primării, Poliție Locală, prefecturi. Trimite sesizarea la adresa corectă — fără ghiceli."
        tagline={`${counties.length} județe · ${Object.keys(PRIMARII).length} primării · ${plCount} secții Poliție Locală · ${cityCount} orașe non-capitale`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Județe acoperite" value={counties.length.toString()} />
        <Stat label="Primării verificate" value={Object.keys(PRIMARII).length.toString()} />
        <Stat label="Poliție Locală" value={plCount.toString()} />
        <Stat label="Orașe non-capitale" value={cityCount.toString()} />
      </div>

      <AutoritatiSearch rows={rows} />

      <section className="mt-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-2)] p-6">
        <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
          Locuiești într-o comună sau sat?
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-3 leading-relaxed">
          România are peste 2.800 de comune și 13.000 de sate — nu le avem încă
          pe toate în catalog. Dacă nu găsești primăria ta aici, trimite sesizarea
          la <strong>Primăria reședinței de județ + Prefectură</strong>. Conform{" "}
          <strong>OG 27/2002</strong>, instituțiile publice sunt obligate să o
          redirecționeze la primăria ta în maxim 5 zile.
        </p>
      </section>

    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-4">
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
