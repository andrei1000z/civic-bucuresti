/**
 * Keywords per county for matching news articles to counties.
 * Includes: county name, capital city, other major cities, notable landmarks,
 * current mayor name, and local institutions.
 *
 * Sources: INS, BEC 2024, Wikipedia RO
 */

export const COUNTY_KEYWORDS: Record<string, string[]> = {
  AB: ["alba", "alba iulia", "aiud", "sebeș", "cugir", "blaj", "gabriel pleșa"],
  AR: ["arad", "lipova", "ineu", "curtici", "pecica", "călin bibarț"],
  AG: ["argeș", "pitești", "câmpulung", "curtea de argeș", "mioveni", "cristian gentea"],
  BC: ["bacău", "onești", "moinești", "comănești", "lucian stanciu"],
  BH: ["bihor", "oradea", "salonta", "beiuș", "marghita", "florin birta"],
  BN: ["bistrița", "năsăud", "beclean", "sângeorz", "ioan turc"],
  BT: ["botoșani", "dorohoi", "cosmin andrei"],
  BR: ["brăila", "marian dragomir"],
  BV: ["brașov", "făgăraș", "săcele", "codlea", "george scripcaru", "rațbv"],
  B: [
    "bucurești", "bucuresti", "capitală", "capitala",
    "pmb", "stb", "metrorex", "metrou",
    "sector 1", "sector 2", "sector 3", "sector 4", "sector 5", "sector 6",
    "s1", "s2", "s3", "s4", "s5", "s6",
    "nicușor dan",
    "unirii", "victoriei", "herăstrău", "pipera", "berceni", "rahova",
    "militari", "titan", "cotroceni", "floreasca", "dorobanți", "colentina",
    "pantelimon", "drumul taberei",
  ],
  BZ: ["buzău", "rm. sărat", "râmnicu sărat", "nehoiu", "constantin toma"],
  CL: ["călărași", "oltenița", "vasile dulce"],
  CS: ["caraș", "severin", "reșița", "caransebeș", "oravița", "bălășoiu"],
  CJ: ["cluj", "cluj-napoca", "turda", "dej", "câmpia turzii", "gherla", "emil boc", "kolozsvár"],
  CT: ["constanța", "mangalia", "medgidia", "cernavodă", "năvodari", "vergil chițac"],
  CV: ["covasna", "sf. gheorghe", "sfântu gheorghe", "târgu secuiesc", "antal árpád"],
  DB: ["dâmbovița", "târgoviște", "moreni", "pucioasa", "cristian stan"],
  DJ: ["dolj", "craiova", "băilești", "calafat", "olguța vasilescu"],
  GL: ["galați", "tecuci", "ionuț pucheanu", "transurb galați"],
  GR: ["giurgiu", "bolintin", "florin barbu"],
  GJ: ["gorj", "târgu jiu", "motru", "novaci", "cârciumaru"],
  HR: ["harghita", "miercurea ciuc", "odorheiu secuiesc", "toplița", "gheorgheni", "galló béla"],
  HD: ["hunedoara", "deva", "petroșani", "brad", "lupeni", "vulcan", "florin oancea"],
  IL: ["ialomița", "slobozia", "fetești", "urziceni", "iulian vladu"],
  IS: ["iași", "iasi", "pașcani", "hârlău", "mihai chirica", "ctp iași"],
  IF: ["ilfov", "voluntari", "popești-leordeni", "bragadiru", "buftea", "hubert thuma"],
  MM: ["maramureș", "baia mare", "sighetu marmației", "borșa", "doru dăncuș"],
  MH: ["mehedinți", "drobeta", "turnu severin", "strehaia", "orșova", "marius screciu"],
  MS: ["mureș", "târgu mureș", "sighișoara", "reghin", "soós zoltán"],
  NT: ["neamț", "piatra neamț", "roman", "târgu neamț", "dragoș chitic"],
  OT: ["olt", "slatina", "caracal", "balș", "corabia", "mircea matei"],
  PH: ["prahova", "ploiești", "câmpina", "vălenii de munte", "sinaia", "mihai polițeanu"],
  SJ: ["sălaj", "zalău", "șimleu", "jibou", "cehu silvaniei", "ionel ciunt"],
  SM: ["satu mare", "carei", "negrești-oaș", "kereskényi"],
  SB: ["sibiu", "mediaș", "cisnădie", "avrig", "agnita", "astrid fodor"],
  SV: ["suceava", "fălticeni", "rădăuți", "câmpulung moldovenesc", "vatra dornei", "ion lungu"],
  TR: ["teleorman", "alexandria", "roșiori", "turnu măgurele", "zimnicea", "ciprian pandele"],
  TM: ["timiș", "timișoara", "lugoj", "buziaș", "jimbolia", "dominic fritz", "stpt"],
  TL: ["tulcea", "babadag", "isaccea", "măcin", "sulina", "ștefan ilie"],
  VL: ["vâlcea", "râmnicu vâlcea", "drăgășani", "băile govora", "călimănești", "mircia gutău"],
  VS: ["vaslui", "bârlad", "huși", "negrești", "vasile păvăleanu"],
  VN: ["vrancea", "focșani", "adjud", "panciu", "odobești", "cristi misăilă"],
};

/**
 * Detect which counties an article is about, based on title + excerpt text.
 * Returns array of county IDs (e.g. ["CJ", "B"]) or empty if no match.
 */
export function detectCounties(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const [countyId, keywords] of Object.entries(COUNTY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(countyId);
    }
  }

  return matched;
}
