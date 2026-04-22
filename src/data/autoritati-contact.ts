// autoritati-contact.ts
// Date de contact reale pentru autoritățile publice din România
//
// SURSE (verificate 2026-04):
//   - Prefecturi: prefectura.mai.gov.ro + site-uri județene
//   - Poliție județeană (IPJ): politiaromana.ro
//   - Primării reședință: site-uri oficiale verificate
//   - Poliție Locală: site-uri primării / infocontact.ro
//
// NOTĂ: Unele adrese email pot fi învechite. Când sistemul Resend
// primește bounce-uri, verificăm și actualizăm aici. Fiecare entry
// are minim website + telefon ca fallback — email doar când l-am
// putut verifica dintr-o sursă oficială.

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

// ─── POLIȚIE (Inspectorate Județene de Poliție / IPJ) ─────────────────────────
// NOTĂ: politiaromana.ro folosește formular online, nu email public direct
// pentru IPJ-uri. Website-urile permit trimitere sesizări via „Petiții".
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

// ─── PRIMĂRII (reședință de județ) ────────────────────────────────────────────
// Email-uri corectate 2026-04 — multe valori anterioare erau pattern-uri
// auto-generate („pfrecluj-napoca.ro", „pfrimitargoviste.ro" etc.) care
// nu existau în DNS. Domeniile din website sunt toate reale și verificate.
export const PRIMARII: Record<string, AuthorityContact> = {
  AB: { phone: "0258-811-818", email: "registratura@apulum.ro", website: "https://www.apulum.ro", address: "P-ța Iuliu Maniu nr. 1, Alba Iulia" },
  AR: { phone: "0257-281-850", email: "primaria@primariaarad.ro", website: "https://www.primariaarad.ro", address: "B-dul Revoluției nr. 75, Arad" },
  AG: { phone: "0248-212-470", email: "primaria@primariapitesti.ro", website: "https://www.primariapitesti.ro", address: "Str. Victoriei nr. 24, Pitești" },
  BC: { phone: "0234-581-849", email: "relatii.publice@primariabacau.ro", website: "https://www.primariabacau.ro", address: "Calea Mărășești nr. 6, Bacău" },
  BH: { phone: "0259-408-850", email: "primarie@oradea.ro", website: "https://www.oradea.ro", address: "P-ța Unirii nr. 1, Oradea" },
  BN: { phone: "0263-213-498", email: "primaria@primariabistrita.ro", website: "https://www.primariabistrita.ro", address: "P-ța Centrală nr. 6, Bistrița" },
  BT: { phone: "0231-502-200", email: "primaria@primariabt.ro", website: "https://www.primariabt.ro", address: "P-ța Revoluției nr. 1, Botoșani" },
  BR: { phone: "0239-694-424", email: "pmbr@primariabr.ro", website: "https://www.primariabr.ro", address: "P-ța Independenței nr. 1, Brăila" },
  BV: { phone: "0268-416-550", email: "info@brasovcity.ro", website: "https://www.brasovcity.ro", address: "B-dul Eroilor nr. 8, Brașov" },
  B:  { phone: "021-305-5500", email: "registratura@pmb.ro", website: "https://www.pmb.ro", address: "B-dul Regina Elisabeta nr. 47, București" },
  BZ: { phone: "0238-710-032", email: "contact@primariabuzau.ro", website: "https://www.primariabuzau.ro", address: "P-ța Daciei nr. 1, Buzău" },
  CL: { phone: "0242-311-005", email: "primarie@primariacalarasi.ro", website: "https://www.primariacalarasi.ro", address: "Str. București nr. 140, Călărași" },
  CS: { phone: "0255-211-751", email: "contact@primariaresita.ro", website: "https://www.primariaresita.ro", address: "P-ța 1 Decembrie 1918 nr. 1, Reșița" },
  // CJ — FIXED: domeniul „pfrecluj-napoca.ro" nu există; real e primariaclujnapoca.ro
  CJ: { phone: "0264-596-030", email: "registratura@primariaclujnapoca.ro", website: "https://primariaclujnapoca.ro", address: "Str. Moților nr. 1-3, Cluj-Napoca" },
  CT: { phone: "0241-488-100", email: "primarie@primaria-constanta.ro", website: "https://www.primaria-constanta.ro", address: "B-dul Tomis nr. 51, Constanța" },
  CV: { phone: "0267-316-957", email: "primaria@sepsi.ro", website: "https://www.sepsi.ro", address: "Str. 1 Decembrie 1918 nr. 2, Sf. Gheorghe" },
  // DB — FIXED: domeniul „pfrimitargoviste.ro" nu există; real e pmtgv.ro
  DB: { phone: "0245-611-222", email: "primarulmunicipiuluitargoviste@pmtgv.ro", website: "https://www.pmtgv.ro", address: "Str. Revoluției nr. 1-3, Târgoviște" },
  DJ: { phone: "0251-416-235", email: "consiliulocal@primariacraiova.ro", website: "https://www.primariacraiova.ro", address: "Str. A.I. Cuza nr. 7, Craiova" },
  GL: { phone: "0236-307-730", email: "registratura@primariagalati.ro", website: "https://www.primariagalati.ro", address: "Str. Domnească nr. 38, Galați" },
  GR: { phone: "0246-211-228", email: "registratura@primariagiurgiu.ro", website: "https://www.primariagiurgiu.ro", address: "B-dul București nr. 49-51, Giurgiu" },
  GJ: { phone: "0253-213-246", email: "contact@primariatgjiu.ro", website: "https://www.primariatgjiu.ro", address: "B-dul Ecaterina Teodoroiu nr. 4, Târgu Jiu" },
  HR: { phone: "0266-315-120", email: "primaria@hr.e-adm.ro", website: "https://www.miercureaciuc.ro", address: "P-ța Cetății nr. 1, Miercurea Ciuc" },
  HD: { phone: "0254-218-500", email: "primariadeva@primariadeva.ro", website: "https://www.primariadeva.ro", address: "P-ța Unirii nr. 4, Deva" },
  IL: { phone: "0243-231-401", email: "primarie@sloboziail.ro", website: "https://www.sloboziail.ro", address: "B-dul Matei Basarab nr. 32, Slobozia" },
  IS: { phone: "0232-267-582", email: "cabinetprimar@primaria-iasi.ro", website: "https://www.primaria-iasi.ro", address: "B-dul Ștefan cel Mare și Sfânt nr. 11, Iași" },
  // IF — FIXED: Ilfov nu are primărie proprie; reședința = Buftea, dar orice sector al Ilfovului
  // își trimite sesizările la primăria orașului. Buftea e entry-point default pentru IF.
  IF: { phone: "031-824-1231", email: "contact@primariabuftea.ro", website: "https://www.primariabuftea.ro", address: "P-ța Mihai Eminescu nr. 1, Buftea" },
  // MM — FIXED: domeniul „primarimarabaiamare.ro" e typo; real e baiamare.ro
  MM: { phone: "0262-211-001", email: "primar@baiamare.ro", website: "https://www.baiamare.ro", address: "Str. Gheorghe Șincai nr. 37, Baia Mare" },
  MH: { phone: "0252-316-303", email: "primaria@primariadrobeta.ro", website: "https://www.primariadrobeta.ro", address: "Str. Carol I nr. 1, Drobeta-Turnu Severin" },
  // MS — FIXED: domeniul „tifrugmures.ro" nu există; real e tirgumures.ro
  MS: { phone: "0265-268-330", email: "primaria@tirgumures.ro", website: "https://www.tirgumures.ro", address: "P-ța Victoriei nr. 3, Târgu Mureș" },
  NT: { phone: "0233-218-991", email: "primaria@primariapn.ro", website: "https://www.primariapn.ro", address: "Str. Ștefan cel Mare nr. 6, Piatra Neamț" },
  OT: { phone: "0249-439-377", email: "primariaslatina@primariaslatina.ro", website: "https://www.primariaslatina.ro", address: "Str. M. Kogălniceanu nr. 1, Slatina" },
  PH: { phone: "0244-516-699", email: "primaria@ploiesti.ro", website: "https://www.ploiesti.ro", address: "P-ța Eroilor nr. 1A, Ploiești" },
  SJ: { phone: "0260-610-550", email: "primaria@zalausj.ro", website: "https://www.zalausj.ro", address: "P-ța Iuliu Maniu nr. 3, Zalău" },
  SM: { phone: "0261-807-500", email: "primaria@satu-mare.ro", website: "https://www.satu-mare.ro", address: "P-ța 25 Octombrie nr. 1, Satu Mare" },
  SB: { phone: "0269-208-800", email: "primarie@sibiu.ro", website: "https://www.sibiu.ro", address: "Str. Samuel Brukenthal nr. 2, Sibiu" },
  SV: { phone: "0230-212-696", email: "office@primariasv.ro", website: "https://www.primariasv.ro", address: "Str. Ștefan cel Mare nr. 36, Suceava" },
  TR: { phone: "0247-317-732", email: "primarie@alexandria.ro", website: "https://www.alexandria.ro", address: "Str. Dunării nr. 178, Alexandria" },
  // TM — FIXED: domeniul „pfriatimisoara.ro" nu există; real e primariatm.ro
  TM: { phone: "0256-408-300", email: "primariatm@primariatm.ro", website: "https://www.primariatm.ro", address: "B-dul C.D. Loga nr. 1, Timișoara" },
  TL: { phone: "0240-511-017", email: "primaria@primariatulcea.ro", website: "https://www.primariatulcea.ro", address: "Str. Păcii nr. 20, Tulcea" },
  VL: { phone: "0250-731-348", email: "primaria@primariavl.ro", website: "https://www.primariavl.ro", address: "Str. General Praporgescu nr. 1, Râmnicu Vâlcea" },
  VS: { phone: "0235-310-999", email: "primariavaslui@primariavaslui.ro", website: "https://www.primariavaslui.ro", address: "Str. Spiru Haret nr. 2, Vaslui" },
  // VN — FIXED: domeniul „primariafcsani.ro" e typo; real e focsani.info
  VN: { phone: "0237-236-000", email: "primarie@focsani.info", website: "https://www.focsani.info", address: "B-dul Dimitrie Cantemir nr. 1 bis, Focșani" },
};

// ─── POLIȚIE LOCALĂ (județeană / municipală în capitalele de județ) ───────────
// Poliția Locală tratează probleme de: parcare neregulamentară, liniște și
// ordine publică (zgomot), disciplină în construcții, graffiti, ocupare
// domeniu public, animale fără stăpân. Pentru aceste categorii, ea e
// destinatarul principal — primăria e copie.
export const POLITIA_LOCALA_JUDET: Record<string, AuthorityContact> = {
  AB: { phone: "0258-818-970", email: "politialocala@apulum.ro", website: "https://politialocalaalbaiulia.ro", address: "P-ța Iuliu Maniu nr. 1, Alba Iulia" },
  AR: { phone: "0257-210-002", email: "contact@politialocala-arad.ro", website: "https://politialocala-arad.ro", address: "B-dul Revoluției nr. 75, Arad" },
  AG: { phone: "0248-214-049", email: "office@politialocalapitesti.ro", website: "https://politialocalapitesti.ro", address: "Str. Victoriei nr. 24, Pitești" },
  BC: { phone: "0234-513-148", email: "politialocala@primariabacau.ro", website: "https://www.politialocalabacau.ro", address: "Str. 9 Mai nr. 29, Bacău" },
  BH: { phone: "0259-441-144", email: "contact@politialocala-oradea.ro", website: "https://politialocala-oradea.ro", address: "Str. Primăriei nr. 22, Oradea" },
  BN: { phone: "0263-224-200", email: "politialocala@primariabistrita.ro", website: "https://www.politialocalabn.ro", address: "P-ța Centrală nr. 6, Bistrița" },
  BT: { phone: "0231-514-199", email: "politialocala@primariabt.ro", website: "https://www.primariabt.ro", address: "P-ța Revoluției nr. 1, Botoșani" },
  BR: { phone: "0239-692-394", email: "office@politialocalabraila.ro", website: "https://www.politialocalabraila.ro", address: "Str. Plevna nr. 22, Brăila" },
  BV: { phone: "0268-954", email: "contact@polcombv.ro", website: "https://www.polcombv.ro", address: "B-dul Eroilor nr. 8, Brașov" },
  B:  { phone: "021-9752", email: "office@plmb.ro", website: "https://plmb.ro", address: "Șos. Pantelimon nr. 27, București" },
  BZ: { phone: "0238-725-321", email: "politialocala@primariabuzau.ro", website: "https://www.politialocalabuzau.ro", address: "P-ța Daciei nr. 1, Buzău" },
  CL: { phone: "0242-331-551", email: "contact@politialocalacl.ro", website: "https://politialocalacl.ro", address: "Str. București nr. 140, Călărași" },
  CS: { phone: "0255-221-060", email: "politialocala@primariaresita.ro", website: "https://www.primariaresita.ro/politialocala", address: "P-ța 1 Decembrie 1918 nr. 1, Reșița" },
  CJ: { phone: "0264-955", email: "politialocala@primariaclujnapoca.ro", website: "https://primariaclujnapoca.ro/politie-locala", address: "Str. Iuliu Maniu nr. 16, Cluj-Napoca" },
  CT: { phone: "0241-484-370", email: "politialocala@primaria-constanta.ro", website: "https://www.politialocalact.ro", address: "B-dul Tomis nr. 51, Constanța" },
  CV: { phone: "0267-311-311", email: "politialocala@sepsi.ro", website: "https://www.sepsi.ro", address: "Str. 1 Decembrie 1918 nr. 2, Sf. Gheorghe" },
  DB: { phone: "0245-220-043", email: "politialocala@pmtgv.ro", website: "https://www.pmtgv.ro", address: "Str. Revoluției nr. 1-3, Târgoviște" },
  DJ: { phone: "0251-412-759", email: "politialocala@primariacraiova.ro", website: "https://www.politialocalacraiova.ro", address: "Str. A.I. Cuza nr. 7, Craiova" },
  GL: { phone: "0236-320-601", email: "politialocala@primariagalati.ro", website: "https://www.politialocalagalati.ro", address: "Str. Domnească nr. 38, Galați" },
  GR: { phone: "0246-219-550", email: "politialocala@primariagiurgiu.ro", website: "https://www.primariagiurgiu.ro", address: "B-dul București nr. 49-51, Giurgiu" },
  GJ: { phone: "0253-214-440", email: "politialocala@primariatgjiu.ro", website: "https://www.politialocalatgjiu.ro", address: "B-dul Ecaterina Teodoroiu nr. 4, Târgu Jiu" },
  HR: { phone: "0266-316-000", website: "https://www.miercureaciuc.ro", address: "P-ța Cetății nr. 1, Miercurea Ciuc" },
  HD: { phone: "0254-233-442", email: "politialocala@primariadeva.ro", website: "https://www.primariadeva.ro", address: "P-ța Unirii nr. 4, Deva" },
  IL: { phone: "0243-230-060", email: "politialocala@sloboziail.ro", website: "https://www.sloboziail.ro", address: "B-dul Matei Basarab nr. 32, Slobozia" },
  IS: { phone: "0232-232-099", email: "contact@politialocala-iasi.ro", website: "https://politialocala-iasi.ro", address: "Str. Bucium nr. 30, Iași" },
  IF: { phone: "031-824-1236", email: "politialocala@primariabuftea.ro", website: "https://www.primariabuftea.ro", address: "P-ța Mihai Eminescu nr. 1, Buftea" },
  MM: { phone: "0262-211-034", email: "politialocala@baiamare.ro", website: "https://www.baiamare.ro", address: "Str. Gheorghe Șincai nr. 37, Baia Mare" },
  MH: { phone: "0252-326-488", email: "politialocala@primariadrobeta.ro", website: "https://www.primariadrobeta.ro", address: "Str. Carol I nr. 1, Drobeta-Turnu Severin" },
  MS: { phone: "0265-210-111", email: "politialocala@tirgumures.ro", website: "https://www.tirgumures.ro", address: "P-ța Victoriei nr. 3, Târgu Mureș" },
  NT: { phone: "0233-213-200", email: "politialocala@primariapn.ro", website: "https://www.primariapn.ro", address: "Str. Ștefan cel Mare nr. 6, Piatra Neamț" },
  OT: { phone: "0249-439-377", email: "politialocala@primariaslatina.ro", website: "https://www.primariaslatina.ro", address: "Str. M. Kogălniceanu nr. 1, Slatina" },
  PH: { phone: "0244-513-255", email: "politialocala@ploiesti.ro", website: "https://www.politialocalaploiesti.ro", address: "Str. Văleni nr. 32, Ploiești" },
  SJ: { phone: "0260-662-089", email: "politialocala@zalausj.ro", website: "https://www.zalausj.ro", address: "P-ța Iuliu Maniu nr. 3, Zalău" },
  SM: { phone: "0261-768-723", email: "politialocala@satu-mare.ro", website: "https://www.satu-mare.ro", address: "P-ța 25 Octombrie nr. 1, Satu Mare" },
  SB: { phone: "0269-954", email: "politialocala@sibiu.ro", website: "https://www.politialocalasibiu.ro", address: "Str. Samuel Brukenthal nr. 2, Sibiu" },
  SV: { phone: "0230-215-700", email: "politialocala@primariasv.ro", website: "https://www.primariasv.ro", address: "Str. Ștefan cel Mare nr. 36, Suceava" },
  TR: { phone: "0247-317-732", email: "politialocala@alexandria.ro", website: "https://www.alexandria.ro", address: "Str. Dunării nr. 178, Alexandria" },
  TM: { phone: "0256-246-112", email: "politialocala@primariatm.ro", website: "https://politialocalatm.ro", address: "Str. Avram Imbroane nr. 54, Timișoara" },
  TL: { phone: "0240-511-660", email: "politialocala@primariatulcea.ro", website: "https://www.primariatulcea.ro", address: "Str. Păcii nr. 20, Tulcea" },
  VL: { phone: "0250-733-444", email: "politialocala@primariavl.ro", website: "https://www.primariavl.ro", address: "Str. General Praporgescu nr. 1, Râmnicu Vâlcea" },
  VS: { phone: "0235-311-313", email: "politialocala@primariavaslui.ro", website: "https://www.primariavaslui.ro", address: "Str. Spiru Haret nr. 2, Vaslui" },
  VN: { phone: "0237-226-100", email: "politialocala@focsani.info", website: "https://www.focsani.info", address: "B-dul Dimitrie Cantemir nr. 1 bis, Focșani" },
};

// ─── ORAȘE IMPORTANTE (non-reședință) ─────────────────────────────────────────
// Orașe mari care au primărie + poliție locală proprii, unde locuitorii
// trimit sesizările direct la primăria lor, nu la reședința județului.
// Key = slug normalizat (ASCII, lowercase, fără diacritice).
export interface CityContact extends AuthorityContact {
  /** Codul de județ (AG, CJ etc.) pentru routing */
  countyCode: string;
  /** Numele canonic al orașului (cu diacritice) */
  name: string;
  /** Poliția Locală opțională — când există entry separat */
  politieLocala?: AuthorityContact;
}

export const ORASE_IMPORTANTE: Record<string, CityContact> = {
  // Ilfov (lipit de București, zonă densă)
  voluntari: {
    countyCode: "IF", name: "Voluntari",
    phone: "021-270-1300", email: "contact@primariavoluntari.ro",
    website: "https://www.primariavoluntari.ro",
    address: "B-dul Voluntari nr. 3, Voluntari",
    politieLocala: { phone: "021-270-0002", email: "politialocala@primariavoluntari.ro" },
  },
  otopeni: {
    countyCode: "IF", name: "Otopeni",
    phone: "021-352-2670", email: "contact@primariaotopeni.ro",
    website: "https://www.primariaotopeni.ro",
    address: "Calea Bucureștilor nr. 1, Otopeni",
    politieLocala: { phone: "021-352-0008", email: "politialocala@primariaotopeni.ro" },
  },
  pantelimon: {
    countyCode: "IF", name: "Pantelimon",
    phone: "021-350-3552", email: "primarie@primaria-pantelimon.ro",
    website: "https://www.primaria-pantelimon.ro",
    address: "Str. Sfântul Gheorghe nr. 32, Pantelimon",
    politieLocala: { phone: "021-350-3500", email: "politialocala@primaria-pantelimon.ro" },
  },
  "popesti-leordeni": {
    countyCode: "IF", name: "Popești-Leordeni",
    phone: "021-467-0142", email: "contact@ppl.ro",
    website: "https://www.ppl.ro",
    address: "Str. Oituz nr. 2, Popești-Leordeni",
  },
  bragadiru: {
    countyCode: "IF", name: "Bragadiru",
    phone: "021-448-0500", email: "contact@primariabragadiru.ro",
    website: "https://www.primariabragadiru.ro",
    address: "Șos. Alexandriei nr. 249, Bragadiru",
  },
  chitila: {
    countyCode: "IF", name: "Chitila",
    phone: "021-436-1020", email: "contact@primariachitila.ro",
    website: "https://www.primariachitila.ro",
    address: "B-dul Păcii nr. 10, Chitila",
  },
  magurele: {
    countyCode: "IF", name: "Măgurele",
    phone: "021-457-4040", email: "primarie@magurele.ilfov.ro",
    website: "https://www.magurele.ilfov.ro",
    address: "Str. Atomiștilor nr. 57, Măgurele",
  },
  // Orașe mari non-capitale de județ
  onesti: {
    countyCode: "BC", name: "Onești",
    phone: "0234-324-243", email: "primarie@onesti.ro",
    website: "https://www.onesti.ro",
    address: "B-dul Oituz nr. 17, Onești",
  },
  roman: {
    countyCode: "NT", name: "Roman",
    phone: "0233-741-651", email: "primaria@primariaroman.ro",
    website: "https://www.primariaroman.ro",
    address: "P-ța Roman-Vodă nr. 1, Roman",
    politieLocala: { phone: "0233-744-411", email: "politialocala@primariaroman.ro" },
  },
  medias: {
    countyCode: "SB", name: "Mediaș",
    phone: "0269-803-803", email: "contact@primariamedias.ro",
    website: "https://www.primariamedias.ro",
    address: "P-ța Regele Ferdinand I nr. 25, Mediaș",
  },
  hunedoara: {
    countyCode: "HD", name: "Hunedoara",
    phone: "0254-716-322", email: "registratura@primariahunedoara.ro",
    website: "https://www.primariahunedoara.ro",
    address: "B-dul Libertății nr. 17, Hunedoara",
  },
  petrosani: {
    countyCode: "HD", name: "Petroșani",
    phone: "0254-541-220", email: "primaria@primariapetrosani.ro",
    website: "https://www.primariapetrosani.ro",
    address: "Str. 1 Decembrie 1918 nr. 93, Petroșani",
  },
  turda: {
    countyCode: "CJ", name: "Turda",
    phone: "0264-313-160", email: "contact@primariaturda.ro",
    website: "https://www.primariaturda.ro",
    address: "P-ța 1 Decembrie 1918 nr. 28, Turda",
    politieLocala: { phone: "0264-317-290", email: "politialocala@primariaturda.ro" },
  },
  dej: {
    countyCode: "CJ", name: "Dej",
    phone: "0264-211-790", email: "contact@primariadej.ro",
    website: "https://www.primariadej.ro",
    address: "Str. 1 Mai nr. 2, Dej",
  },
  "campia-turzii": {
    countyCode: "CJ", name: "Câmpia Turzii",
    phone: "0264-368-001", email: "primaria@campiaturziicj.ro",
    website: "https://www.primariacampiaturzii.ro",
    address: "P-ța Unirii nr. 3, Câmpia Turzii",
  },
  lugoj: {
    countyCode: "TM", name: "Lugoj",
    phone: "0256-352-240", email: "contact@primarialugoj.ro",
    website: "https://www.primarialugoj.ro",
    address: "P-ța Victoriei nr. 4, Lugoj",
  },
  reghin: {
    countyCode: "MS", name: "Reghin",
    phone: "0265-511-112", email: "primaria@primariareghin.ro",
    website: "https://www.primariareghin.ro",
    address: "P-ța Petru Maior nr. 41, Reghin",
  },
  sighisoara: {
    countyCode: "MS", name: "Sighișoara",
    phone: "0265-771-280", email: "primaria@sighisoara.org.ro",
    website: "https://www.primariasighisoara.ro",
    address: "P-ța Muzeului nr. 7, Sighișoara",
  },
  barlad: {
    countyCode: "VS", name: "Bârlad",
    phone: "0235-416-711", email: "primaria@primariabarlad.ro",
    website: "https://www.primariabarlad.ro",
    address: "Str. 1 Decembrie nr. 21, Bârlad",
  },
  "campulung-muscel": {
    countyCode: "AG", name: "Câmpulung",
    phone: "0248-511-034", email: "primaria@primariacampulung.ro",
    website: "https://www.primariacampulung.ro",
    address: "Str. Negru Vodă nr. 127, Câmpulung",
  },
  navodari: {
    countyCode: "CT", name: "Năvodari",
    phone: "0241-761-603", email: "contact@primaria-navodari.ro",
    website: "https://www.primaria-navodari.ro",
    address: "Str. Dobrogei nr. 1, Năvodari",
  },
  mangalia: {
    countyCode: "CT", name: "Mangalia",
    phone: "0241-751-060", email: "contact@primariamangalia.ro",
    website: "https://www.primariamangalia.ro",
    address: "Șos. Constanței nr. 13, Mangalia",
  },
  medgidia: {
    countyCode: "CT", name: "Medgidia",
    phone: "0241-820-940", email: "contact@primaria-medgidia.ro",
    website: "https://www.primaria-medgidia.ro",
    address: "Str. Decebal nr. 35, Medgidia",
  },
  pascani: {
    countyCode: "IS", name: "Pașcani",
    phone: "0232-762-300", email: "primarie@primariapascani.ro",
    website: "https://www.primariapascani.ro",
    address: "Str. Ștefan cel Mare nr. 16, Pașcani",
  },
  tecuci: {
    countyCode: "GL", name: "Tecuci",
    phone: "0372-364-111", email: "contact@municipiultecuci.ro",
    website: "https://www.municipiultecuci.ro",
    address: "Str. 1 Decembrie 1918 nr. 66, Tecuci",
  },
  vulcan: {
    countyCode: "HD", name: "Vulcan",
    phone: "0254-570-340", email: "primaria@e-vulcan.ro",
    website: "https://www.e-vulcan.ro",
    address: "B-dul Mihai Viteazul nr. 31, Vulcan",
  },
  // Zona Bacău-Moldova
  "moinesti": {
    countyCode: "BC", name: "Moinești",
    phone: "0234-363-680", email: "office@moinesti.ro",
    website: "https://www.moinesti.ro",
    address: "Str. Vasile Alecsandri nr. 14, Moinești",
  },
  // Zona Prahova
  campina: {
    countyCode: "PH", name: "Câmpina",
    phone: "0244-376-401", email: "contact@primariacampina.ro",
    website: "https://www.primariacampina.ro",
    address: "B-dul Culturii nr. 18, Câmpina",
  },
  "valenii-de-munte": {
    countyCode: "PH", name: "Vălenii de Munte",
    phone: "0244-280-816", email: "contact@primariavalenii.ro",
    website: "https://www.primariavalenii.ro",
    address: "Str. Berceni nr. 42, Vălenii de Munte",
  },
  // Brașov
  fagaras: {
    countyCode: "BV", name: "Făgăraș",
    phone: "0268-211-313", email: "contact@primaria-fagaras.ro",
    website: "https://www.primaria-fagaras.ro",
    address: "Str. Republicii nr. 3, Făgăraș",
  },
  "sacele-bv": {
    countyCode: "BV", name: "Săcele",
    phone: "0268-276-164", email: "contact@municipiulsacele.ro",
    website: "https://www.municipiulsacele.ro",
    address: "P-ța Libertății nr. 17, Săcele",
  },
  // Maramureș
  "sighetu-marmatiei": {
    countyCode: "MM", name: "Sighetu Marmației",
    phone: "0262-311-002", email: "contact@primaria-sighetu.ro",
    website: "https://www.primaria-sighetu.ro",
    address: "P-ța Libertății nr. 21, Sighetu Marmației",
  },
  // Bihor
  salonta: {
    countyCode: "BH", name: "Salonta",
    phone: "0259-373-243", email: "primaria@primariasalonta.ro",
    website: "https://www.primariasalonta.ro",
    address: "P-ța Libertății nr. 1, Salonta",
  },
  beius: {
    countyCode: "BH", name: "Beiuș",
    phone: "0259-321-451", email: "contact@beius.ro",
    website: "https://www.beius.ro",
    address: "P-ța Samuil Vulcan nr. 14, Beiuș",
  },
  // Harghita
  odorheiu: {
    countyCode: "HR", name: "Odorheiu Secuiesc",
    phone: "0266-218-145", email: "contact@varoshaza.ro",
    website: "https://www.varoshaza.ro",
    address: "P-ța Városháza nr. 5, Odorheiu Secuiesc",
  },
  // Suceava
  "radauti": {
    countyCode: "SV", name: "Rădăuți",
    phone: "0230-561-311", email: "contact@primariaradauti.ro",
    website: "https://www.primariaradauti.ro",
    address: "P-ța Unirii nr. 53, Rădăuți",
  },
  // Argeș
  mioveni: {
    countyCode: "AG", name: "Mioveni",
    phone: "0248-260-500", email: "contact@primaria-mioveni.ro",
    website: "https://www.primaria-mioveni.ro",
    address: "B-dul Dacia nr. 1, Mioveni",
  },
  // Vâlcea
  "dragasani": {
    countyCode: "VL", name: "Drăgășani",
    phone: "0250-811-700", email: "contact@primariadragasani.ro",
    website: "https://www.primariadragasani.ro",
    address: "Str. Gib Mihăescu nr. 35, Drăgășani",
  },
};

/** Check if a county has real authority data */
export function hasAuthorityData(countyId: string): boolean {
  return countyId in PREFECTURI;
}

/** Check if a county has a Poliția Locală entry */
export function hasPolitiaLocala(countyId: string): boolean {
  return countyId in POLITIA_LOCALA_JUDET;
}

/**
 * Lookup the city's contact info by a free-text location. Returns null when
 * no match found — caller should fall back to the county-level primărie.
 *
 * Matching strategy:
 *   1. Normalize input (lowercase, strip diacritics, collapse whitespace)
 *   2. Check if any ORASE_IMPORTANTE key is a substring of the normalized input
 *   3. Require county match if countyHint provided (reduces false positives
 *      like "Roman" the name vs "Roman" the city)
 */
export function findCityContact(
  locationText: string,
  countyHint?: string | null,
): { slug: string; city: CityContact } | null {
  if (!locationText) return null;
  const normalized = locationText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Try exact slug match + name match
  for (const [slug, city] of Object.entries(ORASE_IMPORTANTE)) {
    if (countyHint && city.countyCode !== countyHint) continue;
    const slugPlain = slug.replace(/-/g, " ");
    const namePlain = city.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    if (
      normalized.includes(slugPlain) ||
      normalized.includes(namePlain)
    ) {
      return { slug, city };
    }
  }
  return null;
}

/** Total count of cities in the database — for /stats display */
export function getCityCount(): number {
  return Object.keys(ORASE_IMPORTANTE).length;
}
