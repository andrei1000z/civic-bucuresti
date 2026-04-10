/**
 * Mayors and council leaders of major Romanian cities (outside București).
 * Static snapshot, updated manually. Last update: 2026-04-10.
 *
 * Kept separate from src/data/primari.ts (which is Bucharest-specific
 * and has the full historical list from 1990 to present).
 */

export interface PrimarJudet {
  id: string;
  nume: string;
  partid: string;
  culoarePartid: string;
  city: string;
  countyId: string; // matches data/counties.ts id (CJ, IS, TM, ...)
  perioada: string;
  anInceput: number;
  anSfarsit: number | null;
  website?: string;
  email?: string;
  realizari: string[];
  controverse: string[];
  rating: number; // 0-5
}

export const PRIMARI_JUDETE: PrimarJudet[] = [
  {
    id: "emil-boc-cluj",
    nume: "Emil Boc",
    partid: "PNL",
    culoarePartid: "#EAB308",
    city: "Cluj-Napoca",
    countyId: "CJ",
    perioada: "2012 - prezent (cu mandate anterioare 2004-2008)",
    anInceput: 2012,
    anSfarsit: null,
    website: "https://primariaclujnapoca.ro",
    email: "primaria@primariaclujnapoca.ro",
    realizari: [
      "Cluj-Napoca recunoscut ca hub tech și cultural al României",
      "European Capital of Youth 2015, capitală europeană a inovării",
      "Dezvoltare rețea piste de bicicletă și transport integrat",
      "Buget participativ activ de peste un deceniu",
      "Reabilitări masive școli, spitale, spații publice",
    ],
    controverse: [
      "Creșterea prețului imobiliarelor cel mai rapidă din țară",
      "Aglomerare în centrul vechi, trafic în ore de vârf",
      "Critici pentru viteza lentă a centurii metropolitane",
    ],
    rating: 4.1,
  },
  {
    id: "dominic-fritz-tm",
    nume: "Dominic Fritz",
    partid: "USR",
    culoarePartid: "#3B82F6",
    city: "Timișoara",
    countyId: "TM",
    perioada: "2020 - prezent",
    anInceput: 2020,
    anSfarsit: null,
    website: "https://primariatm.ro",
    email: "primariatm@primariatm.ro",
    realizari: [
      "Timișoara — Capitală Europeană a Culturii 2023",
      "Plan major de reabilitare a patrimoniului secesion",
      "Primul primar străin al unui oraș mare din România",
      "Proiecte de regenerare urbană în Iosefin și Fabric",
      "Investiții importante în transport public electric",
    ],
    controverse: [
      "Critici privind execuția lentă a proiectelor mari de infrastructură",
      "Conflicte cu consilierii PSD/PNL din CL",
      "Amânări ale plății facturilor pentru contractori",
    ],
    rating: 3.6,
  },
  {
    id: "mihai-chirica-is",
    nume: "Mihai Chirica",
    partid: "PNL",
    culoarePartid: "#EAB308",
    city: "Iași",
    countyId: "IS",
    perioada: "2015 - prezent",
    anInceput: 2015,
    anSfarsit: null,
    website: "https://www.primaria-iasi.ro",
    realizari: [
      "Proiecte mari de infrastructură rutieră (Pasaj Octav Băncilă, Bulevardul Chimiei)",
      "Modernizare iluminat public cu LED pe bulevardele principale",
      "Programul de reabilitare a școlilor din municipiu",
      "Proiect tramvai modern (CAF) cu linie nouă",
    ],
    controverse: [
      "Dosare DNA privind achiziții publice",
      "Critici privind autorizații de construire și presiunea imobiliară",
      "Întârzieri cronice la proiectele cu fonduri europene",
    ],
    rating: 2.9,
  },
  {
    id: "vergil-chitac-ct",
    nume: "Vergil Chițac",
    partid: "PNL",
    culoarePartid: "#EAB308",
    city: "Constanța",
    countyId: "CT",
    perioada: "2020 - prezent",
    anInceput: 2020,
    anSfarsit: null,
    website: "https://www.primaria-constanta.ro",
    realizari: [
      "Deblocarea zonei peninsulare după ani de stagnare",
      "Redeschiderea Cazinoului din Constanța (după restaurare)",
      "Buget participativ și consultări publice mai frecvente",
      "Proiecte pentru digitalizarea administrației locale",
    ],
    controverse: [
      "Critici privind gestionarea traficului estival",
      "Întârzieri ale reabilitării bulevardelor principale",
      "Tensiuni cu consiliul local pe buget",
    ],
    rating: 3.2,
  },
  {
    id: "lia-olguta-vasilescu-dj",
    nume: "Lia Olguța Vasilescu",
    partid: "PSD",
    culoarePartid: "#DC2626",
    city: "Craiova",
    countyId: "DJ",
    perioada: "2020 - prezent (anterior 2012-2017)",
    anInceput: 2020,
    anSfarsit: null,
    website: "https://www.primariacraiova.ro",
    realizari: [
      "Modernizarea centrului vechi și pietonalizarea unor zone cheie",
      "Proiectul de tramvai modern și reabilitarea rețelei STPT",
      "Amenajare Parcul Romanescu și alte parcuri",
      "Tu ești Primarul — program de consultare participativă",
    ],
    controverse: [
      "Critici privind stilul autoritar de guvernare",
      "Conflicte publice cu jurnaliști și ONG-uri locale",
      "Întârzieri ale proiectelor cu fonduri europene",
    ],
    rating: 3.3,
  },
  {
    id: "george-scripcaru-bv",
    nume: "George Scripcaru",
    partid: "PNL",
    culoarePartid: "#EAB308",
    city: "Brașov",
    countyId: "BV",
    perioada: "2020 - prezent (mandate anterioare 2004-2016)",
    anInceput: 2020,
    anSfarsit: null,
    website: "https://www.brasovcity.ro",
    realizari: [
      "Deschiderea aeroportului Brașov-Ghimbav (2023)",
      "Reabilitarea Pieței Sfatului și a zonei medievale",
      "Promovarea turismului cultural și de conferințe",
      "Extinderea rețelei de piste de bicicletă",
    ],
    controverse: [
      "Critici privind aglomerarea cartierelor noi fără infrastructură",
      "Întârzieri ale centurii ocolitoare Brașov",
      "Conflicte cu comunitatea de protecția mediului privind defrișările",
    ],
    rating: 3.4,
  },
  {
    id: "ionut-pucheanu-gl",
    nume: "Ionuț Pucheanu",
    partid: "PSD",
    culoarePartid: "#DC2626",
    city: "Galați",
    countyId: "GL",
    perioada: "2016 - prezent",
    anInceput: 2016,
    anSfarsit: null,
    website: "https://www.primariagalati.ro",
    realizari: [
      "Gestionarea intervenției la inundațiile majore din 2024",
      "Reabilitarea falezei Dunării",
      "Modernizarea transportului public cu autobuze electrice",
      "Proiecte de reabilitare termică a blocurilor",
    ],
    controverse: [
      "Critici pentru lipsa de reacție rapidă la inundațiile din 2024",
      "Stagnarea proiectelor de infrastructură rutieră",
      "Scăderea populației municipiului",
    ],
    rating: 2.8,
  },
  {
    id: "andrei-volosevici-ph",
    nume: "Andrei Liviu Volosevici",
    partid: "PNL",
    culoarePartid: "#EAB308",
    city: "Ploiești",
    countyId: "PH",
    perioada: "2020 - prezent",
    anInceput: 2020,
    anSfarsit: null,
    website: "https://www.ploiesti.ro",
    realizari: [
      "Stabilizarea bugetului municipiului după criza OMV Petrom",
      "Reabilitarea rețelei de termoficare (parțial)",
      "Proiect nou Gara de Sud și conectivitate rutieră",
    ],
    controverse: [
      "Probleme cronice la termoficare pe timp de iarnă",
      "Critici pentru infrastructura rutieră degradată",
      "Poluare cronică la rafinării",
    ],
    rating: 2.6,
  },
  {
    id: "florin-birta-bh",
    nume: "Florin Birta",
    partid: "PNL",
    culoarePartid: "#EAB308",
    city: "Oradea",
    countyId: "BH",
    perioada: "2020 - prezent",
    anInceput: 2020,
    anSfarsit: null,
    website: "https://www.oradea.ro",
    realizari: [
      "Continuarea modelului de administrație eficientă moștenit de la Ilie Bolojan",
      "Digitalizare completă a serviciilor pentru cetățeni",
      "Primul oraș din România cu autobuze electrice pe linii principale",
      "Smart City cu senzori de trafic și iluminat",
      "Reabilitare Cetatea Oradea, atracție turistică majoră",
    ],
    controverse: [
      "Critici pentru creșterea datoriei municipale",
      "Tensiuni cu comunitatea maghiară privind etichetarea bilingvă",
    ],
    rating: 4.0,
  },
  {
    id: "marian-dragomir-br",
    nume: "Marian Dragomir",
    partid: "PSD",
    culoarePartid: "#DC2626",
    city: "Brăila",
    countyId: "BR",
    perioada: "2016 - prezent",
    anInceput: 2016,
    anSfarsit: null,
    website: "https://www.primariabr.ro",
    realizari: [
      "Deschiderea podului suspendat peste Dunăre (2023) — cel mai lung din România",
      "Reabilitarea centrului istoric",
      "Proiecte de revitalizare a falezei Dunării",
    ],
    controverse: [
      "Scădere demografică accentuată",
      "Critici pentru infrastructura rutieră degradată",
      "Întârzieri la proiectele cu fonduri europene",
    ],
    rating: 2.9,
  },
  {
    id: "catalin-cherecheș-bm",
    nume: "Cătălin Cherecheș (suspendat)",
    partid: "Indep.",
    culoarePartid: "#64748B",
    city: "Baia Mare",
    countyId: "MM",
    perioada: "2012 - 2023 (arestat, condamnat pentru corupție)",
    anInceput: 2012,
    anSfarsit: 2023,
    website: "https://www.baiamare.ro",
    realizari: [
      "Reabilitarea centrului vechi",
      "Modernizarea piețelor agroalimentare",
      "Proiecte de revitalizare a zonelor miniere abandonate",
    ],
    controverse: [
      "Condamnat la închisoare în 2023 pentru dare de mită",
      "A fugit în Ucraina pentru a evita executarea pedepsei",
      "Extrădare și condamnare ulterioară",
    ],
    rating: 1.8,
  },
  {
    id: "mihai-ghețea-sb",
    nume: "Astrid Fodor",
    partid: "FDGR",
    culoarePartid: "#8B5CF6",
    city: "Sibiu",
    countyId: "SB",
    perioada: "2014 - prezent",
    anInceput: 2014,
    anSfarsit: null,
    website: "https://www.sibiu.ro",
    realizari: [
      "Continuarea modelului Iohannis — administrație predictibilă",
      "Sibiu gazdă permanentă de evenimente culturale internaționale",
      "Modernizarea școlilor și spitalului județean",
      "Proiect smart city cu digitalizarea serviciilor",
    ],
    controverse: [
      "Critici pentru dependența de modelul turistic",
      "Aglomerație în centrul vechi în perioadele de vârf",
    ],
    rating: 3.9,
  },
];

/**
 * Lookup helpers
 */
export function getPrimarByCounty(countyId: string): PrimarJudet | null {
  return PRIMARI_JUDETE.find((p) => p.countyId === countyId.toUpperCase()) ?? null;
}

export function getPrimarByCity(city: string): PrimarJudet | null {
  const q = city.toLowerCase();
  return PRIMARI_JUDETE.find((p) => p.city.toLowerCase() === q) ?? null;
}
