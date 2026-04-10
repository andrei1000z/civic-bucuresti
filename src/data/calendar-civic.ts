/**
 * Static calendar with upcoming civic dates: elections, tax deadlines,
 * public consultations, council meetings. Manually maintained.
 * Last updated: 2026-04-10.
 */

export type CalendarCategory =
  | "alegeri"
  | "taxe"
  | "dezbatere"
  | "consiliu"
  | "deadline"
  | "eveniment";

export interface CalendarEvent {
  id: string;
  date: string; // ISO
  endDate?: string;
  title: string;
  description: string;
  category: CalendarCategory;
  location?: string;
  url?: string;
  countyId?: string; // null = national
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // === TAXE & DEADLINES CETĂȚEAN ===
  {
    id: "tax-impozit-1",
    date: "2026-03-31",
    title: "Deadline impozit pe clădire — rata 1",
    description:
      "Prima rată a impozitului anual pe clădiri, terenuri și auto. Achitare până 31 martie pentru bonus 10% reducere dacă plătești integral.",
    category: "taxe",
    url: "https://www.ghiseul.ro",
  },
  {
    id: "tax-impozit-2",
    date: "2026-09-30",
    title: "Deadline impozit pe clădire — rata 2",
    description:
      "A doua rată a impozitului anual pe clădiri, terenuri și auto. Se plătește până 30 septembrie.",
    category: "taxe",
    url: "https://www.ghiseul.ro",
  },
  {
    id: "tax-declaratie-unica",
    date: "2026-05-25",
    title: "Declarația unică ANAF — deadline depunere",
    description:
      "Toate persoanele fizice cu venituri din activități independente, chirii, dividende, capital trebuie să depună Declarația Unică până pe 25 mai.",
    category: "deadline",
    url: "https://anaf.ro",
  },
  {
    id: "tax-impozit-venit",
    date: "2026-05-25",
    title: "Impozit pe venit — deadline plată",
    description:
      "Plata impozitului datorat pentru veniturile din activități independente, chirii, alte surse conform declarației unice.",
    category: "taxe",
    url: "https://anaf.ro",
  },

  // === ALEGERI ===
  {
    id: "alegeri-parlamentare-2028",
    date: "2028-11-01",
    title: "Alegeri parlamentare 2028",
    description:
      "Data estimativă pentru alegerile parlamentare generale (mandatul 2024-2028 expiră). Se aleg deputați și senatori.",
    category: "alegeri",
  },
  {
    id: "alegeri-locale-2028",
    date: "2028-06-01",
    title: "Alegeri locale 2028",
    description:
      "Alegeri pentru primari, consilii locale și consilii județene. Mandatele actuale (2024-2028) expiră.",
    category: "alegeri",
  },
  {
    id: "alegeri-europarlamentare-2029",
    date: "2029-06-01",
    title: "Alegeri europarlamentare 2029",
    description:
      "Alegeri pentru Parlamentul European. România alege 33 de europarlamentari.",
    category: "alegeri",
  },

  // === CGMB / ȘEDINȚE ===
  {
    id: "cgmb-2026-04",
    date: "2026-04-28",
    title: "Ședință ordinară CGMB — aprilie 2026",
    description:
      "Ședința lunară ordinară a Consiliului General al Municipiului București. Ședințele sunt publice; orice cetățean poate asista.",
    category: "consiliu",
    location: "Sala CGMB, Bd. Regina Elisabeta 47, București",
    countyId: "B",
    url: "https://www.pmb.ro",
  },
  {
    id: "cgmb-2026-05",
    date: "2026-05-26",
    title: "Ședință ordinară CGMB — mai 2026",
    description:
      "Ședință lunară ordinară. Ordinea de zi se publică cu minim 5 zile înainte pe pmb.ro.",
    category: "consiliu",
    location: "Sala CGMB, București",
    countyId: "B",
    url: "https://www.pmb.ro",
  },

  // === DEZBATERI PUBLICE ===
  {
    id: "dezbatere-pug-2026",
    date: "2026-05-01",
    endDate: "2026-06-30",
    title: "Consultare publică — Noul PUG București",
    description:
      "Perioada de consultare publică pentru noul Plan Urbanistic General al Municipiului București. Se primesc observații scrise și în sedinșe publice.",
    category: "dezbatere",
    location: "Online + Primăriile sectoarelor",
    countyId: "B",
    url: "https://www.pmb.ro/urbanism",
  },
  {
    id: "dezbatere-buget-2027",
    date: "2026-11-01",
    endDate: "2026-12-15",
    title: "Consultare publică — Bugetul de stat 2027",
    description:
      "Ministerul Finanțelor publică proiectul de buget pentru 2027 și primește observații. Consultarea durează minim 30 de zile (Legea 52/2003).",
    category: "dezbatere",
    url: "https://mfinante.gov.ro",
  },

  // === ZILE NAȚIONALE & COMEMORĂRI ===
  {
    id: "ziua-nationala-2026",
    date: "2026-12-01",
    title: "Ziua Națională a României",
    description:
      "Zi liberă legală. Parade militare la București, Alba Iulia și alte orașe. Comemorarea Marii Uniri de la 1918.",
    category: "eveniment",
  },
  {
    id: "ziua-europei",
    date: "2026-05-09",
    title: "Ziua Europei",
    description:
      "Sărbătoare europeană. Primăriile organizează evenimente, prezentări, concerte. Steagul UE arborat oficial.",
    category: "eveniment",
  },
  {
    id: "ziua-revolutiei",
    date: "2026-12-22",
    title: "Ziua Revoluției — comemorare",
    description:
      "Ziua de doliu național. Comemorarea victimelor Revoluției din Decembrie 1989. Ceremonii la Timișoara, București, Sibiu, Cluj.",
    category: "eveniment",
  },
  {
    id: "ziua-cutremur-1977",
    date: "2026-03-04",
    title: "Ziua de comemorare — Cutremurul din 1977",
    description:
      "Comemorarea victimelor cutremurului din 4 martie 1977 (1.578 morți). Ceremonii simbolice și exerciții de protecție civilă organizate de IGSU.",
    category: "eveniment",
  },
];

/**
 * Next N upcoming events from now. Sorted ascending by date.
 */
export function getUpcomingEvents(limit = 10): CalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return CALENDAR_EVENTS.filter((e) => {
    const endDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
    return endDate >= today;
  })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}

export const CATEGORY_META: Record<CalendarCategory, { label: string; icon: string; color: string }> = {
  alegeri: { label: "Alegeri", icon: "🗳️", color: "#DC2626" },
  taxe: { label: "Taxe & impozite", icon: "💰", color: "#F59E0B" },
  dezbatere: { label: "Consultare publică", icon: "💬", color: "#3B82F6" },
  consiliu: { label: "Ședințe consiliu", icon: "🏛️", color: "#8B5CF6" },
  deadline: { label: "Deadline cetățean", icon: "⏰", color: "#EF4444" },
  eveniment: { label: "Eveniment național", icon: "📅", color: "#10B981" },
};
