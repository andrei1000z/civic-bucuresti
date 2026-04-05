// Romanian name gender detection for grammatical agreement
// Used in fallback templates and UI preview (AI has its own logic)

const MALE_NAMES = new Set([
  "ion", "andrei", "mihai", "alexandru", "cristian", "radu", "gabriel", "bogdan", "dan", "ștefan", "stefan",
  "nicolae", "george", "vasile", "emil", "claudiu", "cătălin", "catalin", "florin", "sorin", "daniel",
  "marius", "paul", "victor", "mircea", "luca", "adrian", "ciprian", "tudor", "vlad", "matei", "david",
  "horia", "liviu", "ionuț", "ionut", "răzvan", "razvan", "călin", "calin", "eduard", "silviu", "cornel",
  "doru", "iulian", "lucian", "ovidiu", "valentin", "viorel", "petre", "gheorghe", "remus", "dragoș",
  "dragos", "sebastian", "florian", "alin", "bogdan", "cosmin", "damian", "decebal", "dorel", "dorin",
  "emilian", "eugen", "fănel", "fanel", "filip", "flaviu", "ilie", "lucas", "marian", "marin", "martin",
  "mihnea", "miron", "narcis", "nelu", "octavian", "olimpiu", "pavel", "petru", "rares", "robert",
  "sandu", "simion", "titus", "traian", "valeriu", "viorel", "aurel", "aurelian", "bujor", "constantin",
  "costin", "cristi", "dorin", "gigi", "iancu", "iulius", "ladislau", "lazăr", "lazar", "manole",
]);

const FEMALE_NAMES = new Set([
  "maria", "ana", "elena", "ioana", "mihaela", "andreea", "alina", "cristina", "georgiana", "alexandra",
  "simona", "raluca", "diana", "adriana", "roxana", "ramona", "camelia", "gabriela", "daniela", "larisa",
  "claudia", "monica", "iulia", "carmen", "bianca", "oana", "lavinia", "corina", "teodora", "denisa",
  "ileana", "rodica", "silvia", "violeta", "margareta", "florentina", "elisabeta", "tamara", "cătălina",
  "catalina", "valentina", "nicoleta", "felicia", "liliana", "mariana", "victoria", "sanda", "iuliana",
  "loredana", "cornelia", "sorina", "veronica", "luminița", "luminita", "steluța", "steluta", "mirela",
  "angela", "anca", "aurelia", "florica", "ruxandra", "delia", "doina", "dorina", "eugenia", "florina",
  "geanina", "gina", "ionela", "iolanda", "lăcrămioara", "lacramioara", "lenuța", "lenuta", "lucia",
  "luiza", "magda", "magdalena", "marilena", "melania", "mirabela", "natalia", "nadia", "olga", "olivia",
  "paula", "patricia", "petronela", "rafila", "renate", "sabina", "saveta", "silviana", "smaranda",
  "stela", "sultana", "tatiana", "viorica", "zoe", "brîndușa", "brindusa", "cerasela", "ecaterina",
]);

export type Gen = "masculin" | "feminin";

export function detectGen(numeComplet: string): Gen {
  if (!numeComplet) return "masculin";
  // Try each word as a first name (some people write "Popescu Ion" instead of "Ion Popescu")
  const words = numeComplet
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents for lookup
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  for (const w of words) {
    // Strict list match (normalize back for lookup)
    const normalized = w;
    if (MALE_NAMES.has(normalized)) return "masculin";
    if (FEMALE_NAMES.has(normalized)) return "feminin";
    // Try with diacritics put back
    const withDiacritics = numeComplet.toLowerCase().split(/\s+/).find((x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === w);
    if (withDiacritics) {
      if (MALE_NAMES.has(withDiacritics)) return "masculin";
      if (FEMALE_NAMES.has(withDiacritics)) return "feminin";
    }
  }

  // Heuristic fallback: ends in -a/-ea/-ia/-ana/-ela/-ina → feminin
  // But exceptions: Mircea, Luca, Andrea (sometimes masc) — covered above
  for (const w of words) {
    if (/^(mircea|luca|andrea|toma|costea|ilea|coman|matia)$/.test(w)) continue;
    if (/[aeiou]a$/.test(w) || /ia$/.test(w) || /ana$/.test(w) || /ela$/.test(w) || /ina$/.test(w) || /oara$/.test(w)) {
      return "feminin";
    }
  }

  return "masculin";
}

export function subsemnatulForm(gen: Gen): string {
  return gen === "feminin" ? "Subsemnata" : "Subsemnatul";
}

export function domiciliatForm(gen: Gen): string {
  return gen === "feminin" ? "domiciliată" : "domiciliat";
}
