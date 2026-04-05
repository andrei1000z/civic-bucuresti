export interface Directie {
  id: string;
  name: string;
  role: string;
  responsabilitati: string[];
  contact: string;
  bugetAlocat?: string;
}

export const DIRECTII: Directie[] = [
  {
    id: "urbanism",
    name: "Direcția Urbanism",
    role: "Autorizații construire, PUG, PUZ, PUD",
    responsabilitati: [
      "Emitere autorizații de construire",
      "Planuri urbanistice (PUG, PUZ, PUD)",
      "Certificate de urbanism",
      "Verificare disciplină în construcții",
    ],
    contact: "urbanism@pmb.ro · 021/305.55.00 int. 1401",
    bugetAlocat: "~32 mil lei (2024)",
  },
  {
    id: "investitii",
    name: "Direcția Investiții",
    role: "Proiecte majore de infrastructură",
    responsabilitati: [
      "Licitații publice pentru investiții",
      "Supraveghere șantiere PMB",
      "Execuție bugetară pentru investiții",
      "Rapoarte stadiu lucrări",
    ],
    contact: "investitii@pmb.ro · 021/305.55.00 int. 1301",
    bugetAlocat: "~2.1 mld lei (2024)",
  },
  {
    id: "transport",
    name: "Direcția Transport",
    role: "Politici de mobilitate, STB, regulamente",
    responsabilitati: [
      "Reglementare transport public",
      "Tarife și subvenții STB",
      "Parcări publice",
      "Politică mobilitate urbană",
    ],
    contact: "transport@pmb.ro · 021/305.55.00 int. 1501",
    bugetAlocat: "~950 mil lei (2024)",
  },
  {
    id: "mediu",
    name: "Direcția Mediu",
    role: "Calitate aer, spații verzi, deșeuri",
    responsabilitati: [
      "Monitorizare calitate aer",
      "Administrare spații verzi majore",
      "Gestionare deșeuri menajere",
      "Autorizații mediu",
    ],
    contact: "mediu@pmb.ro · 021/305.55.00 int. 1601",
    bugetAlocat: "~180 mil lei (2024)",
  },
  {
    id: "cultura",
    name: "Direcția Cultură",
    role: "Instituții culturale, evenimente",
    responsabilitati: [
      "Teatre, biblioteci, muzee municipale",
      "Evenimente culturale (festivaluri)",
      "Finanțare proiecte culturale",
      "Protejarea monumentelor",
    ],
    contact: "cultura@pmb.ro · 021/305.55.00 int. 1701",
    bugetAlocat: "~140 mil lei (2024)",
  },
  {
    id: "asistenta-sociala",
    name: "Direcția Asistență Socială",
    role: "Servicii sociale, vulnerabili",
    responsabilitati: [
      "Ajutoare sociale, bursele cu venituri reduse",
      "Cantine sociale",
      "Adăposturi pentru vulnerabili",
      "Servicii pentru persoane cu dizabilități",
    ],
    contact: "social@pmb.ro · 021/305.55.00 int. 1801",
    bugetAlocat: "~220 mil lei (2024)",
  },
  {
    id: "buget",
    name: "Direcția Buget și Finanțe",
    role: "Execuție bugetară, taxe și impozite",
    responsabilitati: [
      "Proiectare buget anual",
      "Execuție și raportare buget",
      "Evidența taxelor locale",
      "Achiziții publice",
    ],
    contact: "buget@pmb.ro · 021/305.55.00 int. 1001",
    bugetAlocat: "Coordonare 8.4 mld lei buget total",
  },
  {
    id: "juridica",
    name: "Direcția Juridică",
    role: "Reprezentare în instanță, avizare acte",
    responsabilitati: [
      "Reprezentare PMB în procese",
      "Avizare hotărâri CG",
      "Acces la informații publice (Lege 544)",
      "Consultanță juridică internă",
    ],
    contact: "juridic@pmb.ro · 021/305.55.00 int. 1101",
  },
];

export interface CompanieMunicipala {
  name: string;
  rol: string;
  buget: string;
  angajati: string;
  site: string;
}

export const COMPANII: CompanieMunicipala[] = [
  { name: "STB S.A.", rol: "Transport autobuze, tramvaie, troleibuze", buget: "~950 mil lei/an", angajati: "~7.500", site: "stbsa.ro" },
  { name: "Termoenergetica", rol: "Producție și distribuție agent termic", buget: "~1.8 mld lei/an", angajati: "~2.800", site: "termoenergetica.ro" },
  { name: "ApaNova (concesiune)", rol: "Apă potabilă, canalizare", buget: "Autofinanțare", angajati: "~2.000", site: "apanovabucuresti.ro" },
  { name: "ALPAB", rol: "Administrarea parcurilor și lacurilor", buget: "~120 mil lei/an", angajati: "~850", site: "alpab.ro" },
  { name: "TPBI", rol: "Transport metropolitan Ilfov", buget: "~200 mil lei/an", angajati: "~1.200", site: "tpbi.ro" },
  { name: "Comp. Muni. Imobiliară", rol: "Administrare imobile publice", buget: "~80 mil lei/an", angajati: "~300", site: "pmb.ro" },
  { name: "Comp. Muni. Iluminat", rol: "Iluminat public", buget: "~150 mil lei/an", angajati: "~400", site: "pmb.ro" },
  { name: "Administrația Străzilor", rol: "Întreținere drumuri și semnalizare", buget: "~350 mil lei/an", angajati: "~1.100", site: "pmb.ro" },
  { name: "Administrația Cimitirelor", rol: "Cimitire și servicii funerare", buget: "~25 mil lei/an", angajati: "~220", site: "pmb.ro" },
];

export interface GlosarTerm {
  term: string;
  shortForm: string;
  definition: string;
}

export const GLOSAR: GlosarTerm[] = [
  { term: "Hotărâre Consiliu Local", shortForm: "HCL", definition: "Act normativ emis de CGMB cu efect juridic local. Se votează în ședință publică cu majoritate." },
  { term: "Plan Urbanistic General", shortForm: "PUG", definition: "Document strategic care definește dezvoltarea orașului pe 10-20 ani. Definește zone rezidențiale, comerciale, verzi." },
  { term: "Plan Urbanistic Zonal", shortForm: "PUZ", definition: "Detaliază PUG pentru o zonă specifică. Stabilește regimul de înălțime, procent de construire, spații verzi." },
  { term: "Plan Urbanistic de Detaliu", shortForm: "PUD", definition: "Cel mai detaliat nivel de planificare, pentru imobile specifice sau intervenții locale." },
  { term: "Ordonanță de Urgență", shortForm: "OUG", definition: "Act emis de Guvern în situații extraordinare. Are putere de lege până când Parlamentul o aprobă sau respinge." },
  { term: "Ordonanță a Guvernului", shortForm: "OG", definition: "Act guvernamental adoptat în baza unei legi de abilitare. OG 27/2002 reglementează sesizările cetățenilor." },
];
