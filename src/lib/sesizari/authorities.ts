// Real emails of Bucharest authorities — verified public contacts

export interface Authority {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Central authorities
export const AUTH = {
  pmb: { id: "pmb", name: "Primăria Municipiului București", email: "relatiipublice@pmb.ro" },
  pmbDispecerat: { id: "pmb-dispecerat", name: "Dispecerat PMB", email: "dispecerat@pmb.ro" },
  pmbSesizari: { id: "pmb-sesizari", name: "Sesizări PMB", email: "sesizari@pmb.ro" },
  adminStrazi: { id: "admin-strazi", name: "Administrația Străzilor București", email: "office@aspmb.ro", phone: "021 315 1219" },
  brigadaRutiera: { id: "brigada-rutiera", name: "Brigada Rutieră București", email: "bpr@b.politiaromana.ro", phone: "021 9544" },
  politiaLocalaBuc: { id: "pl-bucuresti", name: "Poliția Locală București", email: "office@plmb.ro", phone: "021 9752" },
  apanova: { id: "apanova", name: "ApaNova", email: "clientsc@apanovabucuresti.ro" },
  alpab: { id: "alpab", name: "ALPAB", email: "alpab@alpab.ro" },
  stb: { id: "stb", name: "STB S.A.", email: "relatii.publice@stbsa.ro" },
  asau: { id: "asau", name: "ASAU (animale)", email: "asau@pmb.ro" },
  prefectura: { id: "prefectura", name: "Prefectura București", email: "prefectura@prefecturabucu.ro" },
  isu: { id: "isu", name: "ISU București", email: "112@isubif.ro" },
} as const;

// Primării de sector
export const PRIMARII_SECTOR: Record<string, Authority> = {
  S1: { id: "primarie-s1", name: "Primăria Sector 1", email: "registratura@primarias1.ro" },
  S2: { id: "primarie-s2", name: "Primăria Sector 2", email: "infopublice@ps2.ro" },
  S3: { id: "primarie-s3", name: "Primăria Sector 3", email: "relatiipublice@primarie3.ro" },
  S4: { id: "primarie-s4", name: "Primăria Sector 4", email: "contact@ps4.ro" },
  S5: { id: "primarie-s5", name: "Primăria Sector 5", email: "sesizari@sector5.ro" },
  S6: { id: "primarie-s6", name: "Primăria Sector 6", email: "prim6@primarie6.ro" },
};

// Poliția Locală per sector
export const POLITIA_LOCALA_SECTOR: Record<string, Authority> = {
  S1: { id: "pl-s1", name: "Poliția Locală Sector 1", email: "registratura@primarias1.ro", phone: "021 9540" },
  S2: { id: "pl-s2", name: "Poliția Locală Sector 2", email: "office@politialocalas2.ro", phone: "021 9941" },
  S3: { id: "pl-s3", name: "Poliția Locală Sector 3", email: "secretariat.dgpl@primarie3.ro", phone: "021 9543" },
  S4: { id: "pl-s4", name: "Poliția Locală Sector 4", email: "sesizari@politialocala4.ro", phone: "021 9441" },
  S5: { id: "pl-s5", name: "Poliția Locală Sector 5", email: "office@politialocalasector5.ro", phone: "021 9541" },
  S6: { id: "pl-s6", name: "Poliția Locală Sector 6", email: "contact@politia6.ro", phone: "021 9546" },
};

export interface ResolvedRecipients {
  primary: Authority[]; // TO field
  cc: Authority[]; // CC field
  label: string;
}

/**
 * Returns the list of real authorities to contact based on problem type + sector + county.
 * For București: uses sector-specific authorities.
 * For other counties: uses county contacts from autoritati-contact.ts.
 */
export function getAuthoritiesFor(tip: string, sector: string | null, countyCode?: string | null): ResolvedRecipients {
  // If not București, route to county authorities
  if (countyCode && countyCode !== "B") {
    return getCountyAuthorities(tip, countyCode);
  }
  const primary: Authority[] = [];
  const cc: Authority[] = [];

  // Helper: add unique
  const addTo = (a: Authority) => {
    if (!primary.find((x) => x.email === a.email)) primary.push(a);
  };
  const addCc = (a: Authority) => {
    if (!primary.find((x) => x.email === a.email) && !cc.find((x) => x.email === a.email)) cc.push(a);
  };

  const sectorPrimarie = sector ? PRIMARII_SECTOR[sector] : null;
  const sectorPolitie = sector ? POLITIA_LOCALA_SECTOR[sector] : null;

  switch (tip) {
    case "groapa":
    case "trotuar":
      addTo(AUTH.adminStrazi);
      if (sectorPrimarie) addTo(sectorPrimarie);
      addTo(AUTH.pmb);
      addCc(AUTH.pmbDispecerat);
      break;

    case "iluminat":
      addTo(AUTH.pmb);
      addTo(AUTH.pmbDispecerat);
      if (sectorPrimarie) addTo(sectorPrimarie);
      break;

    case "copac":
      addTo(AUTH.alpab);
      addTo(AUTH.pmb);
      if (sectorPrimarie) addTo(sectorPrimarie);
      addCc(AUTH.isu);
      break;

    case "gunoi":
      if (sectorPrimarie) addTo(sectorPrimarie);
      addTo(AUTH.pmb);
      addCc(AUTH.pmbDispecerat);
      break;

    case "parcare":
      if (sectorPolitie) addTo(sectorPolitie);
      addTo(AUTH.politiaLocalaBuc);
      if (sectorPrimarie) addTo(sectorPrimarie);
      addCc(AUTH.pmb);
      break;

    case "stalpisori":
      addTo(AUTH.adminStrazi);
      if (sectorPrimarie) addTo(sectorPrimarie);
      addTo(AUTH.pmb);
      addCc(AUTH.pmbDispecerat);
      break;

    case "canalizare":
      addTo(AUTH.apanova);
      addTo(AUTH.pmb);
      if (sectorPrimarie) addTo(sectorPrimarie);
      addCc(AUTH.pmbDispecerat);
      break;

    case "semafor":
      addTo(AUTH.brigadaRutiera);
      addTo(AUTH.adminStrazi);
      addTo(AUTH.pmb);
      if (sectorPrimarie) addCc(sectorPrimarie);
      break;

    case "pietonal":
      addTo(AUTH.brigadaRutiera);
      addTo(AUTH.adminStrazi);
      addTo(AUTH.pmb);
      if (sectorPrimarie) addCc(sectorPrimarie);
      break;

    case "graffiti":
      if (sectorPolitie) addTo(sectorPolitie);
      if (sectorPrimarie) addTo(sectorPrimarie);
      addTo(AUTH.pmb);
      break;

    case "mobilier":
      if (sectorPrimarie) addTo(sectorPrimarie);
      addTo(AUTH.pmb);
      break;

    case "zgomot":
      if (sectorPolitie) addTo(sectorPolitie);
      addTo(AUTH.politiaLocalaBuc);
      if (sectorPrimarie) addCc(sectorPrimarie);
      break;

    case "animale":
      addTo(AUTH.asau);
      addTo(AUTH.pmb);
      if (sectorPrimarie) addTo(sectorPrimarie);
      break;

    case "transport":
      addTo(AUTH.stb);
      addTo(AUTH.pmb);
      break;

    case "altele":
    default:
      addTo(AUTH.pmb);
      if (sectorPrimarie) addTo(sectorPrimarie);
      addCc(AUTH.pmbDispecerat);
      addCc(AUTH.prefectura);
      break;
  }

  // Build human-readable label
  const names = primary.map((a) => {
    // Shorten names for display
    if (a.name.startsWith("Primăria Sector")) return a.name.replace("Primăria ", "");
    if (a.name.startsWith("Primăria Municipiului")) return "PMB";
    if (a.name.startsWith("Administrația")) return a.name.replace("Administrația ", "");
    if (a.name.startsWith("Brigada")) return "Brigada Rutieră";
    if (a.name.startsWith("Poliția Locală")) return a.name.replace("Poliția Locală ", "PL ");
    return a.name;
  });
  const label = names.join(" + ") + (cc.length > 0 ? ` (+ ${cc.length} în CC)` : "");

  return { primary, cc, label };
}

/**
 * Route complaints to county-specific authorities for non-București locations.
 */
function getCountyAuthorities(tip: string, countyCode: string): ResolvedRecipients {
  // Try to import county contacts dynamically
  let PRIMARII: Record<string, { email?: string; phone?: string; website?: string }> = {};
  let PREFECTURI: Record<string, { email?: string; phone?: string }> = {};
  let POLITIE: Record<string, { email?: string; phone?: string }> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const contacts = require("@/data/autoritati-contact");
    PRIMARII = contacts.PRIMARII ?? {};
    PREFECTURI = contacts.PREFECTURI ?? {};
    POLITIE = contacts.POLITIE ?? {};
  } catch {
    // Fallback if module not available
  }

  const primary: Authority[] = [];
  const cc: Authority[] = [];

  const primarie = PRIMARII[countyCode];
  const prefectura = PREFECTURI[countyCode];
  const politie = POLITIE[countyCode];

  // Generic county routing
  if (primarie?.email) {
    primary.push({ id: `primarie-${countyCode}`, name: `Primăria ${countyCode}`, email: primarie.email });
  }

  // Add specialized authorities based on tip
  if (["parcare", "zgomot", "graffiti"].includes(tip) && politie?.email) {
    primary.unshift({ id: `politie-${countyCode}`, name: `IPJ ${countyCode}`, email: politie.email });
  }

  if (prefectura?.email) {
    cc.push({ id: `prefectura-${countyCode}`, name: `Prefectura ${countyCode}`, email: prefectura.email });
  }

  // Fallback: if no specific contacts, generic
  if (primary.length === 0) {
    primary.push({ id: "generic", name: "Primăria locală", email: `registratura@primaria${countyCode.toLowerCase()}.ro` });
  }

  const names = primary.map((a) => a.name);
  const label = names.join(" + ") + (cc.length > 0 ? ` (+ ${cc.length} în CC)` : "");
  return { primary, cc, label };
}
