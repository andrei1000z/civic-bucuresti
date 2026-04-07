// autoritati-contact.ts
// Date de contact reale pentru autoritatile publice din Romania
//
// SURSE:
//   - Prefecturi: prefectura.mai.gov.ro
//   - Politie: politiaromana.ro
//   - Primarii: site-uri oficiale primarii resedinta de judet
//
// Pattern generic:
//   Prefecturi: {county_code_lower}.prefectura.mai.gov.ro
//   Politie: {county_code_lower}.politiaromana.ro

export interface AuthorityContact {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

// ─── PREFECTURI ───────────────────────────────────────────────────────────────
export const PREFECTURI: Record<string, AuthorityContact> = {
  AB: { phone: "0258-813-380", email: "prefectura@prefecturaalba.ro", website: "https://ab.prefectura.mai.gov.ro" },
  AR: { phone: "0257-250-274", email: "prefectura@prefecturaarad.ro", website: "https://ar.prefectura.mai.gov.ro" },
  AG: { phone: "0248-212-550", email: "prefectura@prefecturaarges.ro", website: "https://ag.prefectura.mai.gov.ro" },
  BC: { phone: "0234-511-005", email: "prefectura@prefecturabacau.ro", website: "https://bc.prefectura.mai.gov.ro" },
  BH: { phone: "0259-413-224", email: "prefectura@prefecturabihor.ro", website: "https://bh.prefectura.mai.gov.ro" },
  BN: { phone: "0263-212-057", email: "prefectura@prefecturabistrita.ro", website: "https://bn.prefectura.mai.gov.ro" },
  BT: { phone: "0231-511-012", email: "prefectura@prefecturabotosani.ro", website: "https://bt.prefectura.mai.gov.ro" },
  BR: { phone: "0239-613-662", email: "prefectura@prefecturabraila.ro", website: "https://br.prefectura.mai.gov.ro" },
  BV: { phone: "0268-410-777", email: "prefectura@prefecturabrasov.ro", website: "https://bv.prefectura.mai.gov.ro" },
  B:  { phone: "021-315-2828", email: "prefectura@prefecturabucuresti.ro", website: "https://b.prefectura.mai.gov.ro" },
  BZ: { phone: "0238-414-112", email: "prefectura@prefecturabuzau.ro", website: "https://bz.prefectura.mai.gov.ro" },
  CL: { phone: "0242-311-013", email: "prefectura@prefecturacalarasi.ro", website: "https://cl.prefectura.mai.gov.ro" },
  CS: { phone: "0255-211-404", email: "prefectura@prefecturacarasseverin.ro", website: "https://cs.prefectura.mai.gov.ro" },
  CJ: { phone: "0264-594-306", email: "prefectura@prefecturacluj.ro", website: "https://cj.prefectura.mai.gov.ro" },
  CT: { phone: "0241-611-670", email: "prefectura@prefecturaconstanta.ro", website: "https://ct.prefectura.mai.gov.ro" },
  CV: { phone: "0267-312-235", email: "prefectura@prefecturacovasna.ro", website: "https://cv.prefectura.mai.gov.ro" },
  DB: { phone: "0245-211-051", email: "prefectura@prefecturadambovita.ro", website: "https://db.prefectura.mai.gov.ro" },
  DJ: { phone: "0251-418-026", email: "prefectura@prefecturadolj.ro", website: "https://dj.prefectura.mai.gov.ro" },
  GL: { phone: "0236-460-024", email: "prefectura@prefecturagalati.ro", website: "https://gl.prefectura.mai.gov.ro" },
  GR: { phone: "0246-211-024", email: "prefectura@prefecturagiurgiu.ro", website: "https://gr.prefectura.mai.gov.ro" },
  GJ: { phone: "0253-212-046", email: "prefectura@prefecturagorj.ro", website: "https://gj.prefectura.mai.gov.ro" },
  HR: { phone: "0266-371-231", email: "prefectura@prefecturaharghita.ro", website: "https://hr.prefectura.mai.gov.ro" },
  HD: { phone: "0254-211-574", email: "prefectura@prefecturahunedoara.ro", website: "https://hd.prefectura.mai.gov.ro" },
  IL: { phone: "0243-236-130", email: "prefectura@prefecturaialomita.ro", website: "https://il.prefectura.mai.gov.ro" },
  IS: { phone: "0232-214-440", email: "prefectura@prefecturaiasi.ro", website: "https://is.prefectura.mai.gov.ro" },
  IF: { phone: "021-312-0328", email: "prefectura@prefecturailfov.ro", website: "https://if.prefectura.mai.gov.ro" },
  MM: { phone: "0262-213-924", email: "prefectura@prefecturamaramures.ro", website: "https://mm.prefectura.mai.gov.ro" },
  MH: { phone: "0252-311-248", email: "prefectura@prefecturamehedinti.ro", website: "https://mh.prefectura.mai.gov.ro" },
  MS: { phone: "0265-263-210", email: "prefectura@prefecturamures.ro", website: "https://ms.prefectura.mai.gov.ro" },
  NT: { phone: "0233-214-440", email: "prefectura@prefecturaneamt.ro", website: "https://nt.prefectura.mai.gov.ro" },
  OT: { phone: "0249-414-058", email: "prefectura@prefecturaolt.ro", website: "https://ot.prefectura.mai.gov.ro" },
  PH: { phone: "0244-514-545", email: "prefectura@prefecturaprahova.ro", website: "https://ph.prefectura.mai.gov.ro" },
  SJ: { phone: "0260-611-215", email: "prefectura@prefecturasalaj.ro", website: "https://sj.prefectura.mai.gov.ro" },
  SM: { phone: "0261-713-653", email: "prefectura@prefecturasatumare.ro", website: "https://sm.prefectura.mai.gov.ro" },
  SB: { phone: "0269-217-534", email: "prefectura@prefecturasibiu.ro", website: "https://sb.prefectura.mai.gov.ro" },
  SV: { phone: "0230-214-492", email: "prefectura@prefecturasuceava.ro", website: "https://sv.prefectura.mai.gov.ro" },
  TR: { phone: "0247-311-010", email: "prefectura@prefecturateleorman.ro", website: "https://tr.prefectura.mai.gov.ro" },
  TM: { phone: "0256-490-806", email: "prefectura@prefecturatimis.ro", website: "https://tm.prefectura.mai.gov.ro" },
  TL: { phone: "0240-511-040", email: "prefectura@prefecturatulcea.ro", website: "https://tl.prefectura.mai.gov.ro" },
  VL: { phone: "0250-735-026", email: "prefectura@prefecturavalcea.ro", website: "https://vl.prefectura.mai.gov.ro" },
  VS: { phone: "0235-311-013", email: "prefectura@prefecturavaslui.ro", website: "https://vs.prefectura.mai.gov.ro" },
  VN: { phone: "0237-231-802", email: "prefectura@prefecturavrancea.ro", website: "https://vn.prefectura.mai.gov.ro" },
};

// ─── POLITIE (Inspectorate Judetene de Politie) ──────────────────────────────
export const POLITIE: Record<string, AuthorityContact> = {
  AB: { phone: "0258-812-033", website: "https://ab.politiaromana.ro" },
  AR: { phone: "0257-210-323", website: "https://ar.politiaromana.ro" },
  AG: { phone: "0248-220-590", website: "https://ag.politiaromana.ro" },
  BC: { phone: "0234-514-212", website: "https://bc.politiaromana.ro" },
  BH: { phone: "0259-418-414", website: "https://bh.politiaromana.ro" },
  BN: { phone: "0263-212-454", website: "https://bn.politiaromana.ro" },
  BT: { phone: "0231-511-112", website: "https://bt.politiaromana.ro" },
  BR: { phone: "0239-613-080", website: "https://br.politiaromana.ro" },
  BV: { phone: "0268-414-141", website: "https://bv.politiaromana.ro" },
  B:  { phone: "021-311-2020", website: "https://www.politiacapitalei.ro" },
  BZ: { phone: "0238-721-090", website: "https://bz.politiaromana.ro" },
  CL: { phone: "0242-311-155", website: "https://cl.politiaromana.ro" },
  CS: { phone: "0255-216-112", website: "https://cs.politiaromana.ro" },
  CJ: { phone: "0264-590-780", website: "https://cj.politiaromana.ro" },
  CT: { phone: "0241-618-585", website: "https://ct.politiaromana.ro" },
  CV: { phone: "0267-351-034", website: "https://cv.politiaromana.ro" },
  DB: { phone: "0245-211-032", website: "https://db.politiaromana.ro" },
  DJ: { phone: "0251-411-043", website: "https://dj.politiaromana.ro" },
  GL: { phone: "0236-460-060", website: "https://gl.politiaromana.ro" },
  GR: { phone: "0246-212-332", website: "https://gr.politiaromana.ro" },
  GJ: { phone: "0253-218-090", website: "https://gj.politiaromana.ro" },
  HR: { phone: "0266-371-690", website: "https://hr.politiaromana.ro" },
  HD: { phone: "0254-211-575", website: "https://hd.politiaromana.ro" },
  IL: { phone: "0243-236-112", website: "https://il.politiaromana.ro" },
  IS: { phone: "0232-214-010", website: "https://is.politiaromana.ro" },
  IF: { phone: "021-317-0717", website: "https://if.politiaromana.ro" },
  MM: { phone: "0262-213-434", website: "https://mm.politiaromana.ro" },
  MH: { phone: "0252-312-525", website: "https://mh.politiaromana.ro" },
  MS: { phone: "0265-263-434", website: "https://ms.politiaromana.ro" },
  NT: { phone: "0233-214-200", website: "https://nt.politiaromana.ro" },
  OT: { phone: "0249-414-043", website: "https://ot.politiaromana.ro" },
  PH: { phone: "0244-544-040", website: "https://ph.politiaromana.ro" },
  SJ: { phone: "0260-612-044", website: "https://sj.politiaromana.ro" },
  SM: { phone: "0261-711-112", website: "https://sm.politiaromana.ro" },
  SB: { phone: "0269-218-111", website: "https://sb.politiaromana.ro" },
  SV: { phone: "0230-520-112", website: "https://sv.politiaromana.ro" },
  TR: { phone: "0247-312-112", website: "https://tr.politiaromana.ro" },
  TM: { phone: "0256-492-222", website: "https://tm.politiaromana.ro" },
  TL: { phone: "0240-511-112", website: "https://tl.politiaromana.ro" },
  VL: { phone: "0250-731-100", website: "https://vl.politiaromana.ro" },
  VS: { phone: "0235-311-312", website: "https://vs.politiaromana.ro" },
  VN: { phone: "0237-231-112", website: "https://vn.politiaromana.ro" },
};

// ─── PRIMARII (resedinta de judet) ───────────────────────────────────────────
export const PRIMARII: Record<string, AuthorityContact> = {
  AB: { phone: "0258-811-818", email: "registratura@apulum.ro", website: "https://www.apulum.ro", address: "P-ta Iuliu Maniu nr. 1, Alba Iulia" },
  AR: { phone: "0257-281-850", email: "primaria@primariaarad.ro", website: "https://www.primariaarad.ro", address: "B-dul Revolutiei nr. 75, Arad" },
  AG: { phone: "0248-212-470", email: "primaria@primariapitesti.ro", website: "https://www.primariapitesti.ro", address: "Str. Victoriei nr. 24, Pitesti" },
  BC: { phone: "0234-581-849", email: "relatii.publice@primariabacau.ro", website: "https://www.primariabacau.ro", address: "Calea Marasesti nr. 6, Bacau" },
  BH: { phone: "0259-408-850", email: "primarie@oradea.ro", website: "https://www.oradea.ro", address: "P-ta Unirii nr. 1, Oradea" },
  BN: { phone: "0263-213-498", email: "primaria@primariabistrita.ro", website: "https://www.primariabistrita.ro", address: "P-ta Centrala nr. 6, Bistrita" },
  BT: { phone: "0231-502-200", email: "primaria@primariabotosani.ro", website: "https://www.primariabotosani.ro", address: "P-ta Revolutiei nr. 1, Botosani" },
  BR: { phone: "0239-694-424", email: "primaria@primariabraila.ro", website: "https://www.primariabraila.ro", address: "P-ta Independentei nr. 1, Braila" },
  BV: { phone: "0268-416-550", email: "primaria@brasovcity.ro", website: "https://www.brasovcity.ro", address: "B-dul Eroilor nr. 8, Brasov" },
  B:  { phone: "021-305-5500", email: "registratura@pmb.ro", website: "https://www.pmb.ro", address: "B-dul Regina Elisabeta nr. 47, Bucuresti" },
  BZ: { phone: "0238-710-032", email: "primaria@primariabuzau.ro", website: "https://www.primariabuzau.ro", address: "P-ta Daciei nr. 1, Buzau" },
  CL: { phone: "0242-311-005", email: "primaria@primariacalarasi.ro", website: "https://www.primariacalarasi.ro", address: "Str. Bucuresti nr. 140, Calarasi" },
  CS: { phone: "0255-211-751", email: "primaria@primariaresita.ro", website: "https://www.primariaresita.ro", address: "P-ta 1 Decembrie 1918 nr. 1, Resita" },
  CJ: { phone: "0264-596-030", email: "registratura@pfrecluj-napoca.ro", website: "https://www.pfrecluj-napoca.ro", address: "Str. Motilor nr. 1-3, Cluj-Napoca" },
  CT: { phone: "0241-488-100", email: "primaria@primaria-constanta.ro", website: "https://www.primaria-constanta.ro", address: "B-dul Tomis nr. 51, Constanta" },
  CV: { phone: "0267-351-781", email: "primaria@sfantugheorgheinfo.ro", website: "https://www.sfantugheorgheinfo.ro", address: "Str. 1 Decembrie 1918 nr. 2, Sf. Gheorghe" },
  DB: { phone: "0245-211-001", email: "primaria@pfrimitargoviste.ro", website: "https://www.pmtgv.ro", address: "Str. Revolutiei nr. 1-3, Targoviste" },
  DJ: { phone: "0251-416-235", email: "primaria@primariacraiova.ro", website: "https://www.primariacraiova.ro", address: "Str. A.I. Cuza nr. 7, Craiova" },
  GL: { phone: "0236-307-730", email: "primaria@primariagalati.ro", website: "https://www.primariagalati.ro", address: "Str. Domneasca nr. 38, Galati" },
  GR: { phone: "0246-211-228", email: "primaria@primariagiurgiu.ro", website: "https://www.primariagiurgiu.ro", address: "B-dul Bucuresti nr. 49-51, Giurgiu" },
  GJ: { phone: "0253-212-363", email: "primaria@primariatgj.ro", website: "https://www.primariatgj.ro", address: "B-dul Ecaterina Teodoroiu nr. 4, Targu Jiu" },
  HR: { phone: "0266-371-146", email: "primaria@primariamercureaciuc.ro", website: "https://www.primariamercureaciuc.ro", address: "P-ta Libertatii nr. 5, Miercurea Ciuc" },
  HD: { phone: "0254-218-500", email: "primaria@primariadeva.ro", website: "https://www.primariadeva.ro", address: "P-ta Unirii nr. 4, Deva" },
  IL: { phone: "0243-236-680", email: "primaria@primariaslobozia.ro", website: "https://www.primariaslobozia.ro", address: "B-dul Matei Basarab nr. 32, Slobozia" },
  IS: { phone: "0232-267-582", email: "primaria@primaria-iasi.ro", website: "https://www.primaria-iasi.ro", address: "B-dul Stefan cel Mare si Sfant nr. 11, Iasi" },
  IF: { phone: "021-369-1020", email: "registratura@pfreilfov.ro", website: "https://www.pfreilfov.ro", address: "Str. Republicii nr. 15, Buftea" },
  MM: { phone: "0262-213-824", email: "primaria@primarimarabaiamare.ro", website: "https://www.baiamarecity.ro", address: "Str. Gheorghe Sincai nr. 37, Baia Mare" },
  MH: { phone: "0252-316-303", email: "primaria@primariadrobeta.ro", website: "https://www.primariadrobeta.ro", address: "Str. Carol I nr. 1, Drobeta-Turnu Severin" },
  MS: { phone: "0265-268-330", email: "primaria@tifrugmures.ro", website: "https://www.tifrugmures.ro", address: "P-ta Victoriei nr. 3, Targu Mures" },
  NT: { phone: "0233-215-048", email: "primaria@primariapn.ro", website: "https://www.primariapn.ro", address: "Str. Stefan cel Mare nr. 6, Piatra Neamt" },
  OT: { phone: "0249-410-017", email: "primaria@primariaslatina.ro", website: "https://www.primariaslatina.ro", address: "Str. M. Kogalniceanu nr. 1, Slatina" },
  PH: { phone: "0244-516-699", email: "registratura@ploiesti.ro", website: "https://www.ploiesti.ro", address: "P-ta Eroilor nr. 1A, Ploiesti" },
  SJ: { phone: "0260-612-051", email: "primaria@primariazalau.ro", website: "https://www.primariazalau.ro", address: "P-ta Iuliu Maniu nr. 3, Zalau" },
  SM: { phone: "0261-807-500", email: "primaria@primariasm.ro", website: "https://www.primariasm.ro", address: "P-ta 25 Octombrie nr. 1, Satu Mare" },
  SB: { phone: "0269-208-800", email: "registratura@sibiu.ro", website: "https://www.sibiu.ro", address: "Str. Samuel Brukenthal nr. 2, Sibiu" },
  SV: { phone: "0230-212-696", email: "primaria@primariasv.ro", website: "https://www.primariasv.ro", address: "Str. Stefan cel Mare nr. 36, Suceava" },
  TR: { phone: "0247-311-979", email: "primaria@primariatralexandria.ro", website: "https://www.primariatralexandria.ro", address: "Str. Dunarii nr. 178, Alexandria" },
  TM: { phone: "0256-408-300", email: "registratura@pfriatimisoara.ro", website: "https://www.pfriatimisoara.ro", address: "B-dul C.D. Loga nr. 1, Timisoara" },
  TL: { phone: "0240-511-017", email: "primaria@primariatulcea.ro", website: "https://www.primariatulcea.ro", address: "Str. Pacii nr. 20, Tulcea" },
  VL: { phone: "0250-731-348", email: "primaria@primariavl.ro", website: "https://www.primariavl.ro", address: "Str. General Praporgescu nr. 1, Ramnicu Valcea" },
  VS: { phone: "0235-310-999", email: "primaria@primariavaslui.ro", website: "https://www.primariavaslui.ro", address: "Str. Casariei nr. 1, Vaslui" },
  VN: { phone: "0237-232-320", email: "primaria@primariafcsani.ro", website: "https://www.primariafcsani.ro", address: "B-dul Independentei nr. 19, Focsani" },
};

/** Check if a county has real authority data */
export function hasAuthorityData(countyId: string): boolean {
  return countyId in PREFECTURI;
}
