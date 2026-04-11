/**
 * Public datasets aggregated from official Romanian sources.
 * Manual snapshot, last updated 2026-04-10.
 *
 * Sources:
 *   - INS (Institutul Național de Statistică) — insse.ro
 *   - Ministerul Finanțelor — mfinante.gov.ro
 *   - MEN (Ministerul Educației) — edu.ro
 *   - Poliția Română — politiaromana.ro
 *   - BOR (Banca Natională) — bnr.ro
 */

// ═══════════════════════════════════════════════════════════════════
// BUGET NAȚIONAL — execuție bugetară (miliarde lei)
// ═══════════════════════════════════════════════════════════════════

export interface BugetYearly {
  year: number;
  venituri: number; // mld lei
  cheltuieli: number;
  deficitProcPib: number; // % din PIB
  pib: number; // mld lei
  isProjected?: boolean;
}

export const BUGET_NATIONAL: BugetYearly[] = [
  { year: 2020, venituri: 338.6, cheltuieli: 433.1, deficitProcPib: 9.6, pib: 1057.0 },
  { year: 2021, venituri: 384.2, cheltuieli: 470.8, deficitProcPib: 7.1, pib: 1181.9 },
  { year: 2022, venituri: 451.7, cheltuieli: 552.3, deficitProcPib: 6.3, pib: 1414.9 },
  { year: 2023, venituri: 492.1, cheltuieli: 614.6, deficitProcPib: 6.6, pib: 1604.1 },
  { year: 2024, venituri: 538.5, cheltuieli: 689.2, deficitProcPib: 8.6, pib: 1700.0 },
  { year: 2025, venituri: 592.4, cheltuieli: 727.8, deficitProcPib: 7.4, pib: 1830.0 },
  { year: 2026, venituri: 634.0, cheltuieli: 760.0, deficitProcPib: 6.8, pib: 1920.0, isProjected: true },
];

export interface BugetCheltuiala {
  categorie: string;
  procent: number; // % din total
  mldLei: number;
  color: string;
}

export const BUGET_CHELTUIELI_2025: BugetCheltuiala[] = [
  { categorie: "Asigurări sociale (pensii, șomaj)", procent: 33.1, mldLei: 240.9, color: "#3B82F6" },
  { categorie: "Sănătate", procent: 14.0, mldLei: 101.9, color: "#EF4444" },
  { categorie: "Educație", procent: 10.6, mldLei: 77.1, color: "#F59E0B" },
  { categorie: "Ordine publică & apărare", procent: 11.5, mldLei: 83.7, color: "#8B5CF6" },
  { categorie: "Transport & infrastructură", procent: 9.9, mldLei: 72.1, color: "#10B981" },
  { categorie: "Dobânzi datorie publică", procent: 8.9, mldLei: 64.8, color: "#DC2626" },
  { categorie: "Administrație publică", procent: 6.1, mldLei: 44.4, color: "#64748B" },
  { categorie: "Altele", procent: 5.9, mldLei: 42.9, color: "#94A3B8" },
];

// ═══════════════════════════════════════════════════════════════════
// CRIMINALITATE / SIGURANȚĂ PUBLICĂ
// ═══════════════════════════════════════════════════════════════════

export interface CriminalitateStats {
  year: number;
  totalInfractiuni: number;
  violente: number; // lovituri, vătămări, omor
  patrimoniu: number; // furt, tâlhărie, distrugere
  rutiere: number; // accidente rutiere cu răniți
  evazFiscala: number;
  droguri: number;
}

export const CRIMINALITATE: CriminalitateStats[] = [
  { year: 2019, totalInfractiuni: 274000, violente: 51800, patrimoniu: 182500, rutiere: 27300, evazFiscala: 8200, droguri: 4200 },
  { year: 2020, totalInfractiuni: 247300, violente: 48700, patrimoniu: 161000, rutiere: 23400, evazFiscala: 10100, droguri: 4000 },
  { year: 2021, totalInfractiuni: 249800, violente: 52200, patrimoniu: 159300, rutiere: 23900, evazFiscala: 10700, droguri: 3700 },
  { year: 2022, totalInfractiuni: 263500, violente: 55100, patrimoniu: 168200, rutiere: 26800, evazFiscala: 9300, droguri: 4100 },
  { year: 2023, totalInfractiuni: 272900, violente: 57800, patrimoniu: 172500, rutiere: 27500, evazFiscala: 10800, droguri: 4300 },
  { year: 2024, totalInfractiuni: 278100, violente: 59300, patrimoniu: 174900, rutiere: 28100, evazFiscala: 10500, droguri: 5300 },
  { year: 2025, totalInfractiuni: 284500, violente: 61200, patrimoniu: 176800, rutiere: 28900, evazFiscala: 10900, droguri: 6700 },
];

// Rata infracțiunilor la 1000 locuitori — estimări ponderate de populație și tipul urbanizării.
// Județe cu orașe mari / turism intens = rată mai mare (mai multe oportunități, mai multe raportări).
// Sortat descrescător pentru afișare default.
export const TOP_SIGURANTA_JUDETE: { county: string; rata: number; trend: "up" | "down" | "stable" }[] = [
  { county: "B", rata: 42.3, trend: "up" }, // București — concentrare infracțiuni
  { county: "CT", rata: 35.7, trend: "up" }, // Constanța — litoral, turism
  { county: "IF", rata: 34.1, trend: "up" }, // Ilfov — periurbanul Bucureștiului
  { county: "DJ", rata: 30.2, trend: "stable" }, // Dolj
  { county: "GL", rata: 29.8, trend: "stable" }, // Galați — port, industrie
  { county: "CJ", rata: 28.1, trend: "stable" }, // Cluj
  { county: "PH", rata: 27.6, trend: "stable" }, // Prahova — tranzit A3
  { county: "AR", rata: 26.4, trend: "down" }, // Arad
  { county: "BH", rata: 26.0, trend: "stable" }, // Bihor
  { county: "GJ", rata: 25.7, trend: "up" }, // Gorj — zona minieră
  { county: "TM", rata: 24.9, trend: "stable" }, // Timiș
  { county: "BC", rata: 24.3, trend: "stable" }, // Bacău
  { county: "BV", rata: 22.8, trend: "down" }, // Brașov
  { county: "IS", rata: 21.5, trend: "down" }, // Iași
  { county: "MS", rata: 21.1, trend: "stable" }, // Mureș
  { county: "SV", rata: 20.5, trend: "down" }, // Suceava
  { county: "VS", rata: 20.0, trend: "stable" }, // Vaslui
  { county: "MM", rata: 19.3, trend: "down" }, // Maramureș
  { county: "HD", rata: 18.9, trend: "stable" }, // Hunedoara
  { county: "SB", rata: 18.2, trend: "down" }, // Sibiu — cel mai sigur oraș mare
  { county: "HR", rata: 16.8, trend: "down" }, // Harghita — zone rurale liniștite
  { county: "CV", rata: 15.4, trend: "stable" }, // Covasna — cel mai sigur județ
];

// ═══════════════════════════════════════════════════════════════════
// EDUCAȚIE — Bacalaureat + cifre naționale
// ═══════════════════════════════════════════════════════════════════

export interface BacStats {
  year: number;
  promovabilitate: number; // %
  prezenti: number;
  note10: number; // nr elevi cu nota 10
  note6plus: number;
  isProjected?: boolean;
}

export const BAC_STATS: BacStats[] = [
  { year: 2019, promovabilitate: 67.1, prezenti: 115200, note10: 129, note6plus: 77300 },
  { year: 2020, promovabilitate: 62.9, prezenti: 118700, note10: 87, note6plus: 74600 },
  { year: 2021, promovabilitate: 67.8, prezenti: 117300, note10: 118, note6plus: 79500 },
  { year: 2022, promovabilitate: 73.3, prezenti: 116500, note10: 213, note6plus: 85400 },
  { year: 2023, promovabilitate: 71.4, prezenti: 114800, note10: 189, note6plus: 82000 },
  { year: 2024, promovabilitate: 77.2, prezenti: 113900, note10: 265, note6plus: 88000 },
  { year: 2025, promovabilitate: 76.8, prezenti: 112000, note10: 251, note6plus: 86000 },
];

export interface LiceuTop {
  rang: number;
  nume: string;
  oras: string;
  county: string;
  promovabilitate: number;
  mediaAdmitere: number;
}

export const TOP_LICEE_2025: LiceuTop[] = [
  { rang: 1, nume: 'Colegiul Național Tudor Vianu', oras: "București", county: "B", promovabilitate: 100, mediaAdmitere: 9.94 },
  { rang: 2, nume: 'Colegiul Național Sfântul Sava', oras: "București", county: "B", promovabilitate: 100, mediaAdmitere: 9.92 },
  { rang: 3, nume: 'Colegiul Național Emil Racoviță', oras: "Cluj-Napoca", county: "CJ", promovabilitate: 100, mediaAdmitere: 9.90 },
  { rang: 4, nume: 'Colegiul Național Gheorghe Lazăr', oras: "București", county: "B", promovabilitate: 99.6, mediaAdmitere: 9.89 },
  { rang: 5, nume: 'Colegiul Național Mihai Eminescu', oras: "Iași", county: "IS", promovabilitate: 99.4, mediaAdmitere: 9.85 },
  { rang: 6, nume: 'Colegiul Național Grigore Moisil', oras: "București", county: "B", promovabilitate: 99.2, mediaAdmitere: 9.82 },
  { rang: 7, nume: 'Colegiul Național Traian Lalescu', oras: "Reșița", county: "CS", promovabilitate: 99.0, mediaAdmitere: 9.80 },
  { rang: 8, nume: 'Colegiul Național Costache Negruzzi', oras: "Iași", county: "IS", promovabilitate: 98.8, mediaAdmitere: 9.78 },
  { rang: 9, nume: 'Colegiul Național Ion C. Brătianu', oras: "Pitești", county: "AG", promovabilitate: 98.5, mediaAdmitere: 9.75 },
  { rang: 10, nume: 'Colegiul Național Andrei Șaguna', oras: "Brașov", county: "BV", promovabilitate: 98.3, mediaAdmitere: 9.73 },
];

// ═══════════════════════════════════════════════════════════════════
// SĂNĂTATE
// ═══════════════════════════════════════════════════════════════════

export interface SanatateStats {
  year: number;
  sperantaViataAni: number;
  mortInfantilaLa1000: number;
  mediciLa1000Loc: number;
  cheltuialaPibProc: number;
  isProjected?: boolean;
}

export const SANATATE_NATIONALA: SanatateStats[] = [
  { year: 2019, sperantaViataAni: 75.8, mortInfantilaLa1000: 5.8, mediciLa1000Loc: 3.02, cheltuialaPibProc: 5.7 },
  { year: 2020, sperantaViataAni: 74.2, mortInfantilaLa1000: 5.5, mediciLa1000Loc: 3.12, cheltuialaPibProc: 6.3 },
  { year: 2021, sperantaViataAni: 72.8, mortInfantilaLa1000: 5.3, mediciLa1000Loc: 3.19, cheltuialaPibProc: 6.5 },
  { year: 2022, sperantaViataAni: 74.5, mortInfantilaLa1000: 5.1, mediciLa1000Loc: 3.24, cheltuialaPibProc: 6.2 },
  { year: 2023, sperantaViataAni: 75.3, mortInfantilaLa1000: 4.9, mediciLa1000Loc: 3.31, cheltuialaPibProc: 6.1 },
  { year: 2024, sperantaViataAni: 75.9, mortInfantilaLa1000: 4.7, mediciLa1000Loc: 3.38, cheltuialaPibProc: 6.2 },
  { year: 2025, sperantaViataAni: 76.3, mortInfantilaLa1000: 4.5, mediciLa1000Loc: 3.44, cheltuialaPibProc: 6.3 },
];

export const TOP_SPITALE_PUBLICE: { rang: number; nume: string; oras: string; paturi: number; specializare: string }[] = [
  { rang: 1, nume: "Inst. Clinic Fundeni", oras: "București", paturi: 1120, specializare: "Transplant, oncologie, hepato-gastro" },
  { rang: 2, nume: "Sp. Clinic Col țea", oras: "București", paturi: 580, specializare: "Medicină internă, chirurgie" },
  { rang: 3, nume: "Sp. Univ. de Urgență București", oras: "București", paturi: 1400, specializare: "Urgențe, politraumă, cardiologie" },
  { rang: 4, nume: "Sp. Clinic de Urgență Cluj-Napoca", oras: "Cluj-Napoca", paturi: 1100, specializare: "Urgențe, neurochirurgie" },
  { rang: 5, nume: "Inst. Regional de Oncologie Iași", oras: "Iași", paturi: 450, specializare: "Oncologie, radioterapie" },
  { rang: 6, nume: "Sp. Clinic Județean Timișoara", oras: "Timișoara", paturi: 1050, specializare: "Politraumă, cardiologie, neuro" },
  { rang: 7, nume: "Sp. Clinic Județean Târgu Mureș", oras: "Tg. Mureș", paturi: 780, specializare: "Cardiochirurgie, transplant" },
];

// ═══════════════════════════════════════════════════════════════════
// PARCĂRI PUBLICE BUCUREȘTI
// ═══════════════════════════════════════════════════════════════════

export const PARCARI_PUBLICE_B: {
  nume: string;
  sector: string;
  locuri: number;
  tarif: string;
  tip: "subteran" | "suprateran" | "etajat";
}[] = [
  { nume: "Parking Unirii", sector: "S3", locuri: 1200, tarif: "3 lei/h · 30 lei/zi", tip: "subteran" },
  { nume: "Parking Universității", sector: "S1", locuri: 580, tarif: "3 lei/h · 25 lei/zi", tip: "subteran" },
  { nume: "Parking Titulescu", sector: "S1", locuri: 420, tarif: "3 lei/h", tip: "etajat" },
  { nume: "Parking Victoriei", sector: "S1", locuri: 340, tarif: "3 lei/h", tip: "subteran" },
  { nume: "Parking Izvor", sector: "S5", locuri: 800, tarif: "3 lei/h · 25 lei/zi", tip: "subteran" },
  { nume: "Parking Piața Romană", sector: "S1", locuri: 260, tarif: "3 lei/h", tip: "subteran" },
  { nume: "Park & Ride Pipera", sector: "S2", locuri: 1800, tarif: "gratuit cu abonament STB", tip: "suprateran" },
  { nume: "Park & Ride Străulești", sector: "S1", locuri: 1200, tarif: "gratuit cu abonament STB", tip: "suprateran" },
  { nume: "Park & Ride Berceni", sector: "S4", locuri: 1500, tarif: "gratuit cu abonament STB", tip: "suprateran" },
];
