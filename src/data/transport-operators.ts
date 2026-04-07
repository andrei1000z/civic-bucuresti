// Comprehensive transport operator database for Romania
// Sources: official operator websites, 2024-2025

export interface TransportOperator {
  name: string;
  website: string;
  types: string[]; // ["autobuz", "tramvai", "troleibuz", "metrou", "microbuz"]
  ticketPrice: string; // e.g. "3 lei" or "3-5 lei"
  monthlyPass: string; // e.g. "80 lei" or "50-100 lei"
  app?: string; // mobile app name if exists
  contactPhone?: string;
  lines?: number; // approximate number of lines
  coverage: string; // short description
}

// Keyed by the transportPublicOperator name from statistici-judete.ts
export const OPERATORS: Record<string, TransportOperator> = {
  /* ─── București ─── */
  "STB + Metrorex": {
    name: "STB București",
    website: "https://stbsa.ro",
    types: ["autobuz", "tramvai", "troleibuz"],
    ticketPrice: "3 lei",
    monthlyPass: "80 lei",
    app: "STB / 24pay",
    contactPhone: "021-9391",
    lines: 170,
    coverage: "București + Ilfov",
  },
  Metrorex: {
    name: "Metrorex",
    website: "https://metrorex.ro",
    types: ["metrou"],
    ticketPrice: "5 lei",
    monthlyPass: "100 lei",
    app: "24pay",
    contactPhone: "021-9393",
    lines: 5,
    coverage: "5 magistrale, 63 stații",
  },

  /* ─── Cluj ─── */
  "CTP Cluj-Napoca": {
    name: "CTP Cluj-Napoca",
    website: "https://ctpcj.ro",
    types: ["autobuz", "troleibuz"],
    ticketPrice: "4 lei",
    monthlyPass: "85 lei",
    app: "CTP Cluj-Napoca",
    contactPhone: "0264-430917",
    lines: 40,
    coverage: "Cluj-Napoca + zonă metropolitană",
  },

  /* ─── Timișoara ─── */
  "STPT Timișoara": {
    name: "STPT Timișoara",
    website: "https://stpt.ro",
    types: ["autobuz", "tramvai", "troleibuz"],
    ticketPrice: "3.5 lei",
    monthlyPass: "80 lei",
    app: "24pay / Visa contactless",
    contactPhone: "0256-277050",
    lines: 40,
    coverage: "Timișoara + localități limitrofe",
  },

  /* ─── Iași ─── */
  "CTP Iași": {
    name: "CTP Iași",
    website: "https://sctpiasi.ro",
    types: ["autobuz", "tramvai"],
    ticketPrice: "3 lei",
    monthlyPass: "70 lei",
    app: "24pay",
    contactPhone: "0232-267891",
    lines: 50,
    coverage: "Iași + zonă metropolitană",
  },

  /* ─── Constanța ─── */
  "CT Bus Constanța": {
    name: "CT Bus Constanța",
    website: "https://ctbus.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "70 lei",
    app: "CT Bus / 24pay",
    contactPhone: "0241-694960",
    lines: 30,
    coverage: "Constanța + Mamaia + Năvodari",
  },

  /* ─── Brașov ─── */
  "RATBV Brașov": {
    name: "RATBV Brașov",
    website: "https://ratbv.ro",
    types: ["autobuz"],
    ticketPrice: "3.5 lei",
    monthlyPass: "80 lei",
    app: "24pay",
    contactPhone: "0268-427420",
    lines: 40,
    coverage: "Brașov + Poiana Brașov + Săcele + Cristian",
  },

  /* ─── Sibiu ─── */
  "Tursib Sibiu": {
    name: "Tursib Sibiu",
    website: "https://tfrb.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "60 lei",
    app: "24pay",
    contactPhone: "0269-217778",
    lines: 20,
    coverage: "Sibiu + Cisnădie + Șelimbăr",
  },

  /* ─── Oradea ─── */
  "OTL Oradea": {
    name: "OTL Oradea",
    website: "https://otlra.ro",
    types: ["autobuz", "tramvai"],
    ticketPrice: "3 lei",
    monthlyPass: "65 lei",
    app: "24pay",
    contactPhone: "0259-307777",
    lines: 20,
    coverage: "Oradea + localități limitrofe",
  },

  /* ─── Craiova ─── */
  "RAT Craiova": {
    name: "RAT Craiova",
    website: "https://ratcraiova.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "70 lei",
    contactPhone: "0251-419243",
    lines: 25,
    coverage: "Craiova",
  },

  /* ─── Galați ─── */
  "Transurb Galați": {
    name: "Transurb Galați",
    website: "https://transurb.ro",
    types: ["autobuz", "tramvai"],
    ticketPrice: "2.5 lei",
    monthlyPass: "60 lei",
    contactPhone: "0236-471818",
    lines: 20,
    coverage: "Galați",
  },

  /* ─── Ploiești ─── */
  "TCE Ploiești": {
    name: "TCE Ploiești",
    website: "https://tce.ro",
    types: ["autobuz", "troleibuz"],
    ticketPrice: "3 lei",
    monthlyPass: "65 lei",
    contactPhone: "0244-543751",
    lines: 15,
    coverage: "Ploiești",
  },

  /* ─── Suceava ─── */
  "TPL Suceava": {
    name: "TPL Suceava",
    website: "https://tfrb.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "60 lei",
    contactPhone: "0230-514472",
    lines: 15,
    coverage: "Suceava + Burdujeni",
  },

  /* ─── Baia Mare ─── */
  "Urbis Baia Mare": {
    name: "Urbis Baia Mare",
    website: "https://urbis.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "60 lei",
    lines: 10,
    coverage: "Baia Mare",
  },

  /* ─── Satu Mare ─── */
  "Trans Urban Satu Mare": {
    name: "Transurban Satu Mare",
    website: "https://transurban.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 10,
    coverage: "Satu Mare",
  },

  /* ─── Bistrița ─── */
  "Urban Serv Bistrița": {
    name: "Urban Serv Bistrița",
    website: "https://transportlocal.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 10,
    coverage: "Bistrița",
  },

  /* ─── Arad ─── */
  "CTP Arad": {
    name: "CTP Arad",
    website: "https://ctparad.ro",
    types: ["autobuz", "tramvai"],
    ticketPrice: "3 lei",
    monthlyPass: "65 lei",
    contactPhone: "0257-254040",
    lines: 20,
    coverage: "Arad + localități limitrofe",
  },

  /* ─── Brăila ─── */
  "RATB Brăila": {
    name: "Braicar Brăila",
    website: "https://braicar.ro",
    types: ["autobuz", "tramvai"],
    ticketPrice: "2.5 lei",
    monthlyPass: "55 lei",
    lines: 15,
    coverage: "Brăila",
  },

  /* ─── Pitești ─── */
  "RAT Pitești": {
    name: "Publitrans Pitești",
    website: "https://publitrans.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "65 lei",
    lines: 15,
    coverage: "Pitești + Mioveni",
  },

  /* ─── Târgu Mureș ─── */
  "Compania de Transport Târgu Mureș": {
    name: "Compania de Transport Târgu Mureș",
    website: "https://transloc.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "60 lei",
    lines: 15,
    coverage: "Târgu Mureș",
  },

  /* ─── Bacău ─── */
  "Transcălăuza Bacău": {
    name: "Transcălăuza Bacău",
    website: "https://stpbacau.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 12,
    coverage: "Bacău",
  },

  /* ─── Botoșani ─── */
  "RATT Botoșani": {
    name: "RATT Botoșani",
    website: "https://eltranssa.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 10,
    coverage: "Botoșani",
  },

  /* ─── Buzău ─── */
  "RAT Buzău": {
    name: "Trans Urban Buzău",
    website: "https://transurbis.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 12,
    coverage: "Buzău",
  },

  /* ─── Alba Iulia ─── */
  "Urbana Alba Iulia": {
    name: "STP Alba Iulia",
    website: "https://stpalba.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 10,
    coverage: "Alba Iulia + Sebeș",
  },

  /* ─── Reșița ─── */
  "STPT Reșița": {
    name: "STPT Reșița",
    website: "https://stptresita.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 8,
    coverage: "Reșița",
  },

  /* ─── Sfântu Gheorghe ─── */
  "Covline Sfântu Gheorghe": {
    name: "Multi-Trans Sfântu Gheorghe",
    website: "https://multitrans.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 8,
    coverage: "Sfântu Gheorghe",
  },

  /* ─── Târgoviște ─── */
  "TPL Târgoviște": {
    name: "TPL Târgoviște",
    website: "https://tfrb.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 10,
    coverage: "Târgoviște",
  },

  /* ─── Deva ─── */
  "RAT Deva": {
    name: "RAT Deva",
    website: "https://transportdeva.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 8,
    coverage: "Deva + Hunedoara",
  },

  /* ─── Piatra Neamț ─── */
  "TPL Piatra Neamț": {
    name: "TPL Piatra Neamț",
    website: "https://tfrb.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 10,
    coverage: "Piatra Neamț",
  },

  /* ─── Drobeta-Turnu Severin ─── */
  "RAT Drobeta-Turnu Severin": {
    name: "RAT Drobeta-Turnu Severin",
    website: "https://ratdts.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 8,
    coverage: "Drobeta-Turnu Severin",
  },

  /* ─── Zalău ─── */
  "Transbus Zalău": {
    name: "Transbus Zalău",
    website: "https://transbuszalau.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 8,
    coverage: "Zalău",
  },

  /* ─── Tulcea ─── */
  "RAT Tulcea": {
    name: "RAT Tulcea",
    website: "https://rattulcea.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 6,
    coverage: "Tulcea",
  },

  /* ─── Râmnicu Vâlcea ─── */
  "RAT Vâlcea": {
    name: "ELT Râmnicu Vâlcea",
    website: "https://eltrans.ro",
    types: ["autobuz", "troleibuz"],
    ticketPrice: "3 lei",
    monthlyPass: "55 lei",
    lines: 12,
    coverage: "Râmnicu Vâlcea",
  },

  /* ─── Focșani ─── */
  "Trans Urban Focșani": {
    name: "Trans Urban Focșani",
    website: "https://transurbanfocsani.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 8,
    coverage: "Focșani",
  },

  /* ─── Vaslui ─── */
  "Trans Urban Vaslui": {
    name: "Trans Urban Vaslui",
    website: "https://transurbanvaslui.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "45 lei",
    lines: 6,
    coverage: "Vaslui",
  },

  /* ─── Slobozia ─── */
  "SC Urban Serv Slobozia": {
    name: "Urban Serv Slobozia",
    website: "https://urbanservslobozia.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "45 lei",
    lines: 5,
    coverage: "Slobozia",
  },

  /* ─── Giurgiu ─── */
  "Trans Urban Giurgiu": {
    name: "Trans Urban Giurgiu",
    website: "https://transurbangiurgiu.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "45 lei",
    lines: 5,
    coverage: "Giurgiu",
  },

  /* ─── Călărași ─── */
  "Trans Urban Călărași": {
    name: "Trans Urban Călărași",
    website: "https://transurbancalarasi.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "45 lei",
    lines: 5,
    coverage: "Călărași",
  },

  /* ─── Târgu Jiu ─── */
  "Transloc Târgu Jiu": {
    name: "Transloc Târgu Jiu",
    website: "https://transloctj.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "50 lei",
    lines: 8,
    coverage: "Târgu Jiu",
  },

  /* ─── Miercurea Ciuc ─── */
  "Trans Harghita Miercurea Ciuc": {
    name: "Trans Harghita",
    website: "https://transharghita.ro",
    types: ["autobuz"],
    ticketPrice: "3 lei",
    monthlyPass: "50 lei",
    lines: 6,
    coverage: "Miercurea Ciuc + Toplița",
  },

  /* ─── Slatina ─── */
  "Trans Urban Slatina": {
    name: "Trans Urban Slatina",
    website: "https://transurbanslatina.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "45 lei",
    lines: 6,
    coverage: "Slatina",
  },

  /* ─── Alexandria ─── */
  "Trans Urban Alexandria": {
    name: "Trans Urban Alexandria",
    website: "https://transurbanalexandria.ro",
    types: ["autobuz"],
    ticketPrice: "2.5 lei",
    monthlyPass: "45 lei",
    lines: 5,
    coverage: "Alexandria",
  },

  /* ─── Ilfov (fallback, uses STB) ─── */
  "Diverse operatori locali": {
    name: "STB / Operatori Ilfov",
    website: "https://stbsa.ro",
    types: ["autobuz", "microbuz"],
    ticketPrice: "3-5 lei",
    monthlyPass: "80 lei",
    coverage: "Ilfov — deservit parțial de STB",
  },
};

// Backward-compatible export: flat URL map
export const TRANSPORT_WEBSITES: Record<string, string> = Object.fromEntries(
  Object.entries(OPERATORS).map(([key, op]) => [key, op.website]),
);
