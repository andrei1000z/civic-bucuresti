// intreruperi.ts
// Întreruperi programate de apă / caldură / gaz / electricitate + lucrări
// de stradă. Seed static pentru v1. La v2 se mută într-un tabel Supabase
// populat de crawler cron (Apa Nova, Termoenergetica, PMB, Distrigaz etc.).
//
// SURSE (scraping planificat):
//   - apanovabucuresti.ro/intreruperi
//   - termoenergetica.ro/lista-avarii
//   - distrigaz-sud-retele.ro/avarii
//   - pmb.ro/anunturi-lucrari
//   - sesizari.edistributie.com/harta-avarii
//
// ACTUALIZAT MANUAL: 2026-04-24

export type InterruptionType =
  | "apa"
  | "caldura"
  | "gaz"
  | "electricitate"
  | "lucrari-strazi"
  | "altele";

export type InterruptionStatus =
  | "programat"
  | "in-desfasurare"
  | "finalizat"
  | "anulat";

export interface Interruption {
  id: string;
  /** Codul din sistemul providerului — pentru deduplicare pe re-scrape. */
  externalId?: string;
  type: InterruptionType;
  status: InterruptionStatus;
  /** Compania sau instituția (ex: "Apa Nova", "Termoenergetica", "PMB"). */
  provider: string;
  /** Link către pagina providerului (sau anunțul public original). */
  sourceUrl?: string;
  /** Motivul (ex: „Lucrări de reabilitare magistrala 2"). */
  reason: string;
  /** Lista de adrese / străzi afectate. */
  addresses: string[];
  /** Coord lat/lng principale (centrul zonei). */
  lat?: number;
  lng?: number;
  /** Cod județ (B, CJ, TM, etc.). */
  county: string;
  /** Ex: „București", „Cluj-Napoca". */
  locality?: string;
  /** Doar pentru București: S1-S6. */
  sector?: string;
  /** ISO 8601 — începutul efectiv / programat. */
  startAt: string;
  /** ISO 8601 — sfârșit estimat. */
  endAt: string;
  /** Estimare număr persoane afectate (opțional). */
  affectedPopulation?: number;
  /** Text scurt pentru listări (≤200 caractere). */
  excerpt?: string;
}

// ─── SEED ────────────────────────────────────────────────────────────────────
// Date reale/realiste — se vor înlocui automat când crawler-ul rulează.
// Pot fi actualizate manual de admin prin Supabase dashboard până când
// scraper-ul e gata.
// Toate datele de mai jos sunt 2026-04 - 2026-05 (proiecții realiste
// bazate pe announcements tipice Apa Nova + Termoenergetica).

const NOW = new Date();
const iso = (offsetDays: number, hour = 8): string => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const INTRERUPERI: Interruption[] = [
  // ═══ BUCUREȘTI ══════════════════════════════════════════════════════
  {
    id: "tm-magistrala-2-sudest",
    type: "caldura",
    status: "programat",
    provider: "Termoenergetica",
    sourceUrl: "https://www.termoenergetica.ro/lista-avarii",
    reason: "Lucrări de reabilitare a magistralei 2 — tronson Sud-Est",
    addresses: [
      "Șos. Mihai Bravu (între Piața Muncii și Piața Iancului)",
      "Str. Baba Novac",
      "Str. Constantin Brâncuși",
      "B-dul Camil Ressu (zona Blv. Basarabia)",
    ],
    lat: 44.4390,
    lng: 26.1384,
    county: "B",
    locality: "București",
    sector: "S3",
    startAt: iso(3),
    endAt: iso(5, 18),
    affectedPopulation: 18000,
    excerpt:
      "Caldură și apă caldă întreruptă 3 zile pe Mihai Bravu, Baba Novac, Brâncuși, Camil Ressu.",
  },
  {
    id: "apa-nova-victoriei-21",
    type: "apa",
    status: "programat",
    provider: "Apa Nova București",
    sourceUrl: "https://www.apanovabucuresti.ro/intreruperi",
    reason: "Înlocuire conductă distribuție Ø200mm — intervenție programată",
    addresses: [
      "Calea Victoriei (între P-ța Revoluției și Str. Luterană)",
      "Str. Luterană",
      "Str. George Enescu",
    ],
    lat: 44.4413,
    lng: 26.0971,
    county: "B",
    locality: "București",
    sector: "S1",
    startAt: iso(1, 22),
    endAt: iso(2, 6),
    affectedPopulation: 4200,
    excerpt:
      "Apa oprită 8 ore noaptea pe Calea Victoriei + străzi adiacente pentru înlocuire conductă.",
  },
  {
    id: "tm-complex-iancului",
    type: "caldura",
    status: "programat",
    provider: "Termoenergetica",
    sourceUrl: "https://www.termoenergetica.ro/lista-avarii",
    reason: "Test presiune + revizie anuală — CET complex Iancului",
    addresses: [
      "B-dul Ferdinand I (între Str. Avrig și Șos. Iancului)",
      "Șos. Iancului",
      "Str. Licurg",
    ],
    lat: 44.4489,
    lng: 26.1300,
    county: "B",
    locality: "București",
    sector: "S2",
    startAt: iso(7),
    endAt: iso(7, 20),
    affectedPopulation: 9500,
    excerpt: "Test anual caldură, zona Iancului - Ferdinand. Max 12 ore.",
  },
  {
    id: "pmb-magheru-asfaltare",
    type: "lucrari-strazi",
    status: "in-desfasurare",
    provider: "ASPMB",
    sourceUrl: "https://www.pmb.ro/anunturi-lucrari",
    reason: "Asfaltare covor — banda 1 și 2 sens Piața Romană",
    addresses: ["B-dul Gheorghe Magheru (între P-ța Romană și P-ța Universității)"],
    lat: 44.4419,
    lng: 26.0990,
    county: "B",
    locality: "București",
    sector: "S1",
    startAt: iso(-2),
    endAt: iso(10, 20),
    affectedPopulation: 0,
    excerpt:
      "Trafic restricționat pe Magheru (sens către P-ța Romană) — 12 zile.",
  },
  {
    id: "distrigaz-crangasi",
    type: "gaz",
    status: "programat",
    provider: "Distrigaz Sud Rețele",
    sourceUrl: "https://distrigazsud-retele.ro/avarii",
    reason: "Înlocuire conductă polietilenă — strada Crângași",
    addresses: [
      "Șos. Crângași (nr. 12-36)",
      "Str. Constructorilor",
      "Calea Crângași",
    ],
    lat: 44.4538,
    lng: 26.0450,
    county: "B",
    locality: "București",
    sector: "S6",
    startAt: iso(2, 8),
    endAt: iso(2, 16),
    affectedPopulation: 1800,
    excerpt: "Gaz oprit 8h în zona Crângași pentru înlocuire conductă.",
  },
  {
    id: "edistr-balta-alba",
    type: "electricitate",
    status: "programat",
    provider: "E-Distribuție Muntenia",
    sourceUrl: "https://sesizari.edistributie.com/harta-avarii",
    reason: "Lucrări mentenanță post transformare — cartier Balta Albă",
    addresses: [
      "Șos. Mihai Bravu (între Metrou Dristor 2 și Trapezului)",
      "B-dul Camil Ressu",
      "Str. Liviu Rebreanu",
    ],
    lat: 44.4090,
    lng: 26.1545,
    county: "B",
    locality: "București",
    sector: "S3",
    startAt: iso(4, 9),
    endAt: iso(4, 15),
    affectedPopulation: 6800,
    excerpt: "Curent oprit 6h cartier Balta Albă — mentenanță post trafo.",
  },
  {
    id: "pmb-stirbei-voda-pietonalizare",
    type: "lucrari-strazi",
    status: "programat",
    provider: "PMB",
    sourceUrl: "https://www.pmb.ro/anunturi-lucrari",
    reason: "Pietonalizare parțială + amenajare trotuar",
    addresses: ["Str. Știrbei Vodă (între Sala Radio și Biserica Sf. Elefterie)"],
    lat: 44.4408,
    lng: 26.0829,
    county: "B",
    locality: "București",
    sector: "S1",
    startAt: iso(14),
    endAt: iso(60),
    excerpt:
      "Știrbei Vodă închisă parțial 6 săptămâni — pietonalizare tronson central.",
  },
  // ═══ CLUJ-NAPOCA ═════════════════════════════════════════════════════
  {
    id: "cs-cluj-manastur",
    type: "caldura",
    status: "programat",
    provider: "Colterm / RADP Cluj-Napoca",
    reason: "Proba de presiune + revizie anuală — cartier Mănăștur",
    addresses: ["Str. Mehedinți", "Str. Parâng", "Str. Ciucaș"],
    lat: 46.7630,
    lng: 23.5460,
    county: "CJ",
    locality: "Cluj-Napoca",
    startAt: iso(5, 7),
    endAt: iso(5, 19),
    affectedPopulation: 7200,
    excerpt: "Test anual caldură Mănăștur — 12 ore.",
  },
  {
    id: "cs-cluj-centru-asfaltare",
    type: "lucrari-strazi",
    status: "in-desfasurare",
    provider: "Primăria Cluj-Napoca",
    reason: "Refacere carosabil + marcaje",
    addresses: ["Str. Memorandumului", "P-ța Mihai Viteazul (zona piață)"],
    lat: 46.7696,
    lng: 23.5896,
    county: "CJ",
    locality: "Cluj-Napoca",
    startAt: iso(-5),
    endAt: iso(6, 20),
    excerpt: "Refacere carosabil centru Cluj — până sâmbătă viitoare.",
  },
  // ═══ TIMIȘOARA ═══════════════════════════════════════════════════════
  {
    id: "aquatim-iosefin",
    type: "apa",
    status: "programat",
    provider: "Aquatim Timișoara",
    reason: "Schimbare contoare + hidranți — Iosefin",
    addresses: ["Str. Carei", "B-dul 16 Decembrie 1989", "Str. Alba Iulia"],
    lat: 45.7492,
    lng: 21.2186,
    county: "TM",
    locality: "Timișoara",
    startAt: iso(1, 9),
    endAt: iso(1, 17),
    affectedPopulation: 2400,
    excerpt: "Apă oprită 8h în Iosefin pentru schimbare contoare.",
  },
  {
    id: "colterm-fabric",
    type: "caldura",
    status: "programat",
    provider: "Colterm Timișoara",
    reason: "Revizie rețea CET2 — cartier Fabric",
    addresses: ["Str. Ștefan cel Mare", "Str. Dacilor", "Str. 3 August 1919"],
    lat: 45.7521,
    lng: 21.2339,
    county: "TM",
    locality: "Timișoara",
    startAt: iso(8, 8),
    endAt: iso(10, 18),
    affectedPopulation: 5400,
    excerpt: "Caldură oprită 3 zile în Fabric — revizie CET2.",
  },
  // ═══ IAȘI ════════════════════════════════════════════════════════════
  {
    id: "apavital-copou",
    type: "apa",
    status: "programat",
    provider: "Apavital Iași",
    reason: "Lucrări modernizare rețea — Copou",
    addresses: ["B-dul Carol I (între Copou și T. Vuia)", "Str. Sărărie"],
    lat: 47.1871,
    lng: 27.5736,
    county: "IS",
    locality: "Iași",
    startAt: iso(6, 8),
    endAt: iso(6, 20),
    affectedPopulation: 3200,
    excerpt: "Apă oprită 12h în Copou pentru modernizare rețea.",
  },
  // ═══ CONSTANȚA ═══════════════════════════════════════════════════════
  {
    id: "raja-mamaia",
    type: "apa",
    status: "programat",
    provider: "RAJA Constanța",
    reason: "Pregătire rețea pentru sezon estival — Mamaia Nord",
    addresses: ["B-dul Mamaia", "Str. Soveja (zona Mamaia)"],
    lat: 44.2242,
    lng: 28.6338,
    county: "CT",
    locality: "Constanța",
    startAt: iso(11, 7),
    endAt: iso(11, 15),
    affectedPopulation: 1500,
    excerpt:
      "Apă oprită 8h în Mamaia Nord — pregătire sezon estival.",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getInterruptionsForCounty(countyCode: string): Interruption[] {
  return INTRERUPERI.filter((i) => i.county.toUpperCase() === countyCode.toUpperCase());
}

/**
 * Filtrează întreruperile active (nu finalizate/anulate) + le sortează
 * cu cele în desfășurare primele, apoi cele programate după data de început.
 */
export function getActiveInterruptions(): Interruption[] {
  const now = Date.now();
  return [...INTRERUPERI]
    .filter((i) => {
      if (i.status === "anulat") return false;
      if (i.status === "finalizat") return false;
      return new Date(i.endAt).getTime() >= now;
    })
    .sort((a, b) => {
      // „in-desfasurare" primele
      if (a.status === "in-desfasurare" && b.status !== "in-desfasurare") return -1;
      if (a.status !== "in-desfasurare" && b.status === "in-desfasurare") return 1;
      // apoi după start
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
}

export const TYPE_LABELS: Record<InterruptionType, string> = {
  apa: "Apă",
  caldura: "Caldură",
  gaz: "Gaz",
  electricitate: "Electricitate",
  "lucrari-strazi": "Lucrări la stradă",
  altele: "Altele",
};

export const TYPE_ICONS: Record<InterruptionType, string> = {
  apa: "💧",
  caldura: "🔥",
  gaz: "🔶",
  electricitate: "⚡",
  "lucrari-strazi": "🚧",
  altele: "📢",
};

export const TYPE_COLORS: Record<InterruptionType, string> = {
  apa: "#3B82F6",
  caldura: "#F97316",
  gaz: "#EAB308",
  electricitate: "#A855F7",
  "lucrari-strazi": "#F59E0B",
  altele: "#64748B",
};

export const STATUS_LABELS: Record<InterruptionStatus, string> = {
  programat: "Programat",
  "in-desfasurare": "În desfășurare",
  finalizat: "Finalizat",
  anulat: "Anulat",
};

export const STATUS_COLORS: Record<InterruptionStatus, string> = {
  programat: "#3B82F6",
  "in-desfasurare": "#F59E0B",
  finalizat: "#059669",
  anulat: "#6B7280",
};
