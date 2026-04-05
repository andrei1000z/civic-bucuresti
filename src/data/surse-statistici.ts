// Catalog de surse pentru statistici — citation mapping

export interface Sursa {
  name: string;
  url: string;
  year: string;
  publisher: string;
}

export const SURSE: Record<string, Sursa> = {
  "drpciv-accidente": {
    name: "Raport anual accidente rutiere România",
    url: "https://www.drpciv.ro",
    year: "2023",
    publisher: "DRPCIV",
  },
  "politie-rutiera": {
    name: "Statistici Poliția Rutieră București",
    url: "https://www.politiaromana.ro/ro/prevenire/politia-rutiera",
    year: "2024",
    publisher: "Poliția Română",
  },
  "calitate-aer": {
    name: "Rețeaua Națională de Monitorizare a Calității Aerului",
    url: "https://www.calitateaer.ro",
    year: "2024-2025",
    publisher: "ANPM",
  },
  "stb-raport": {
    name: "Raport anual Societatea de Transport București",
    url: "https://www.stbsa.ro/rapoarte-anuale",
    year: "2023",
    publisher: "STB S.A.",
  },
  "metrorex-raport": {
    name: "Raport anual Metrorex",
    url: "https://www.metrorex.ro/transparenta-decizionala",
    year: "2023",
    publisher: "Metrorex S.A.",
  },
  "ins-populatie": {
    name: "Populația rezidentă București",
    url: "https://insse.ro",
    year: "2024",
    publisher: "INS",
  },
  "pmb-spatii-verzi": {
    name: "Studiu spații verzi București",
    url: "https://www.pmb.ro",
    year: "2023",
    publisher: "PMB — Direcția Mediu",
  },
  "alpab": {
    name: "Administrația Lacuri, Parcuri și Agrement București",
    url: "https://alpab.ro",
    year: "2024",
    publisher: "ALPAB",
  },
  "pmb-sesizari": {
    name: "Portal sesizări Primăria București",
    url: "https://www.pmb.ro/sesizari",
    year: "2024",
    publisher: "PMB",
  },
  "civic-local": {
    name: "Baza proprie de sesizări Civia",
    url: "/sesizari",
    year: "live",
    publisher: "Civia",
  },
};
