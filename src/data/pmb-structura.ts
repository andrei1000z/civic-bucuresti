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
  // Planificare urbană & acte normative
  { term: "Hotărâre Consiliu Local", shortForm: "HCL", definition: "Act normativ emis de CGMB sau consiliul local cu efect juridic local. Se votează în ședință publică cu majoritate." },
  { term: "Plan Urbanistic General", shortForm: "PUG", definition: "Document strategic care definește dezvoltarea orașului pe 10-20 ani. Definește zone rezidențiale, comerciale, verzi." },
  { term: "Plan Urbanistic Zonal", shortForm: "PUZ", definition: "Detaliază PUG pentru o zonă specifică. Stabilește regimul de înălțime, procent de construire, spații verzi." },
  { term: "Plan Urbanistic de Detaliu", shortForm: "PUD", definition: "Cel mai detaliat nivel de planificare, pentru imobile specifice sau intervenții locale." },
  { term: "Ordonanță de Urgență", shortForm: "OUG", definition: "Act emis de Guvern în situații extraordinare. Are putere de lege până când Parlamentul o aprobă sau respinge." },
  { term: "Ordonanță a Guvernului", shortForm: "OG", definition: "Act guvernamental adoptat în baza unei legi de abilitare. OG 27/2002 reglementează sesizările cetățenilor." },
  { term: "Certificat de Urbanism", shortForm: "CU", definition: "Document informativ emis de primărie despre regimul juridic, economic și tehnic al unui teren. Necesar pentru PUZ, autorizații." },
  { term: "Autorizație de Construire", shortForm: "AC", definition: "Aprobare oficială pentru începerea lucrărilor. Emisă de primărie pe baza proiectului tehnic și a avizelor." },
  { term: "Certificat de Nomenclatură Stradală", shortForm: "CNS", definition: "Confirmă adresa poștală oficială a unui imobil. Necesar la acte notariale și carte de identitate." },

  // Consilii & administrație locală
  { term: "Consiliul General al Municipiului București", shortForm: "CGMB", definition: "Autoritatea deliberativă a Capitalei — 55 consilieri aleși pentru 4 ani. Aprobă bugetul PMB, PUG, taxele locale." },
  { term: "Consiliul Local", shortForm: "CL", definition: "Autoritatea deliberativă la nivel de comună, oraș sau sector. Numărul membrilor depinde de populație." },
  { term: "Consiliul Județean", shortForm: "CJ", definition: "Autoritatea deliberativă la nivel de județ. Coordonează activitatea consiliilor locale din județ." },
  { term: "Primăria Municipiului București", shortForm: "PMB", definition: "Administrația publică a Capitalei. Condusă de primarul general și împărțită în direcții și companii municipale." },
  { term: "Serviciul Public de Asistență Socială", shortForm: "SPAS", definition: "Serviciu public local care gestionează ajutoarele sociale, ancheta socială, alocațiile pentru familii vulnerabile." },
  { term: "Direcția Generală de Asistență Socială și Protecția Copilului", shortForm: "DGASPC", definition: "Serviciu județean pentru copii, persoane cu dizabilități și persoane vârstnice aflate în dificultate." },

  // Autorități centrale & agenții
  { term: "Autoritatea Electorală Permanentă", shortForm: "AEP", definition: "Instituție autonomă care organizează alegerile și supraveghează finanțarea partidelor și campaniilor electorale." },
  { term: "Biroul Electoral Central", shortForm: "BEC", definition: "Organ temporar care supraveghează alegerile și totalizează rezultatele la nivel național. Activ doar în perioada electorală." },
  { term: "Consiliul Național al Audiovizualului", shortForm: "CNA", definition: "Autoritate care reglementează televiziunea și radioul. Poate amenda posturile care încalcă legea audiovizualului." },
  { term: "Direcția Națională Anticorupție", shortForm: "DNA", definition: "Structură specializată a Parchetului care investighează infracțiunile de corupție de nivel mediu și înalt." },
  { term: "Agenția Națională de Integritate", shortForm: "ANI", definition: "Instituție care verifică averea și interesele demnitarilor și funcționarilor publici. Poate sesiza instanța pentru incompatibilități." },
  { term: "Agenția Națională de Administrare Fiscală", shortForm: "ANAF", definition: "Administrația fiscală centrală. Colectează impozite, TVA, contribuții sociale și controlează firmele." },
  { term: "Inspecția Muncii", shortForm: "ITM", definition: "Controlează respectarea legislației muncii, securitatea la locul de muncă și contractele individuale." },
  { term: "Inspectoratul Școlar Județean", shortForm: "ISJ", definition: "Coordonează unitățile de învățământ dintr-un județ. Gestionează evaluările naționale și rezultatele Bacalaureatului." },
  { term: "Inspectoratul de Poliție Județean", shortForm: "IPJ", definition: "Structura teritorială a Poliției Române la nivel de județ. Coordonează secțiile locale și ordinea publică." },
  { term: "Inspectoratul General pentru Situații de Urgență", shortForm: "IGSU", definition: "Coordonează intervențiile la incendii, accidente, cutremure, inundații. Operează echipajele SMURD." },
  { term: "Direcția de Sănătate Publică", shortForm: "DSP", definition: "Autoritatea sanitară la nivel județean. Monitorizează bolile transmisibile, inspectează unitățile medicale și alimentare." },
  { term: "Direcția Sanitară Veterinară", shortForm: "DSVSA", definition: "Direcția Sanitară Veterinară și pentru Siguranța Alimentelor. Controlează calitatea alimentelor și sănătatea animalelor." },
  { term: "Registrul Auto Român", shortForm: "RAR", definition: "Instituție care certifică starea tehnică a autovehiculelor. Efectuează inspecția tehnică periodică (ITP)." },

  // Transparență & integritate
  { term: "Sistemul Electronic de Achiziții Publice", shortForm: "SEAP", definition: "Platforma online unde sunt publicate toate licitațiile publice din România. Deschis oricui pentru consultare." },
  { term: "Autoritatea Națională pentru Protecția Datelor", shortForm: "ANSPDCP", definition: "Autoritatea pentru protecția datelor cu caracter personal. Aplică GDPR în România, poate amenda operatorii." },
  { term: "Legea Accesului la Informații Publice", shortForm: "L544", definition: "Legea 544/2001: orice cetățean poate solicita informații publice de la autorități. Răspuns obligatoriu în 10 zile (prelungire max 30)." },
  { term: "Legea Transparenței Decizionale", shortForm: "L52", definition: "Legea 52/2003: obligă autoritățile să consulte public proiectele de acte normative (minim 30 zile) înainte de adoptare." },
  { term: "Legea Petiționării", shortForm: "OG27", definition: "OG 27/2002: orice cetățean poate depune petiții autorităților. Termenul legal de răspuns este 30 de zile." },

  // Urgență & intervenție
  { term: "Serviciul Mobil de Urgență, Reanimare și Descarcerare", shortForm: "SMURD", definition: "Serviciu medical de urgență operat de pompieri — ambulanțe cu medic, descarcerare accidente, salvare montană." },
  { term: "Departamentul pentru Situații de Urgență", shortForm: "DSU", definition: "Structura interministerială care coordonează intervențiile la dezastre și urgențe medicale de amploare." },
  { term: "Serviciul Național de Alerte", shortForm: "RO-ALERT", definition: "Sistem național de avertizare prin SMS în caz de urgențe (furtuni, inundații, dispariții copii, atacuri teroriste)." },

  // Taxe & populație
  { term: "Codul Numeric Personal", shortForm: "CNP", definition: "Identificator unic atribuit fiecărui cetățean român. Codifică sex, data nașterii, județul de naștere." },
  { term: "Cod Unic de Înregistrare", shortForm: "CUI", definition: "Cod atribuit firmelor și persoanelor juridice la înregistrarea la Registrul Comerțului." },
  { term: "Casa Națională de Asigurări de Sănătate", shortForm: "CNAS", definition: "Administrează fondul național de sănătate. Eliberează carduri de sănătate și decontează serviciile medicale." },
  { term: "Direcția Regim Permise Auto și Înmatricularea Vehiculelor", shortForm: "DRPCIV", definition: "Emite permise de conducere, certificate de înmatriculare și gestionează baza de date privind accidentele rutiere." },
];
