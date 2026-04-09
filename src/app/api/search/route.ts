import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ghiduri } from "@/data/ghiduri";
import { evenimente } from "@/data/evenimente";
import { ALL_COUNTIES } from "@/data/counties";
import { bilete, linii } from "@/data/bilete";
import { primari } from "@/data/primari";
import { DIRECTII, COMPANII, GLOSAR } from "@/data/pmb-structura";
import { SESIZARI_GUIDES } from "@/data/sesizari-guides";
import { OPERATORS } from "@/data/transport-operators";

export const revalidate = 60;

interface SearchResult {
  type: "sesizare" | "ghid" | "eveniment" | "stire" | "page" | "judet" | "bilet" | "linie" | "primar" | "directie" | "companie" | "glosar" | "ghid-sesizare" | "transport" | "ai";
  title: string;
  url: string;
  excerpt?: string;
  meta?: string;
}

const STATIC_PAGES: SearchResult[] = [
  { type: "page", title: "Sesizări", url: "/sesizari", excerpt: "Depune sesizări către autorități" },
  { type: "page", title: "Hărți", url: "/harti", excerpt: "Piste bicicletă, drumuri, transport, calitate aer" },
  { type: "page", title: "Statistici", url: "/statistici", excerpt: "Date naționale: accidente, AQI, populație" },
  { type: "page", title: "Știri", url: "/stiri", excerpt: "Știri civice din surse verificate" },
  { type: "page", title: "Evenimente", url: "/evenimente", excerpt: "Evenimente majore din România" },
  { type: "page", title: "Ghiduri", url: "/ghiduri", excerpt: "Ghiduri practice pentru cetățeni" },
  { type: "page", title: "Calitate aer", url: "/aer", excerpt: "Hartă live cu senzori din toată România" },
  { type: "page", title: "Bilete transport", url: "/bilete", excerpt: "Tarife transport public București" },
  { type: "page", title: "Sesizări publice", url: "/sesizari-publice", excerpt: "Ce semnalează alți cetățeni" },
  { type: "page", title: "Urmărește sesizarea", url: "/urmareste", excerpt: "Verifică statusul sesizării tale" },
  { type: "page", title: "Contul tău", url: "/cont", excerpt: "Profil + sesizările tale" },
  { type: "page", title: "Cum funcționează", url: "/cum-functioneaza", excerpt: "Ghid despre administrația publică, CGMB, sesizări" },
  { type: "page", title: "Primari București", url: "/cum-functioneaza#primari", excerpt: "Toți primarii Capitalei din 1990 până azi" },
  { type: "page", title: "Structura PMB", url: "/cum-functioneaza#structura", excerpt: "Direcții, companii municipale, organigrama PMB" },
  { type: "page", title: "Quiz civic", url: "/quiz", excerpt: "Testează-ți cunoștințele despre administrația Bucureștiului" },
];

function sanitizeForPostgrest(q: string): string {
  return q.replace(/[,()*.:\\]/g, "").slice(0, 64);
}

/** Split query into words; a haystack matches if EVERY word appears somewhere in it */
function matchesAll(haystack: string, words: string[]): boolean {
  return words.every((w) => haystack.includes(w));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qRaw = (searchParams.get("q") ?? "").trim().toLowerCase();
  if (!qRaw || qRaw.length < 2) return NextResponse.json({ data: [] });
  const q = qRaw;
  const words = qRaw.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return NextResponse.json({ data: [] });
  const qSafe = sanitizeForPostgrest(qRaw);

  const results: SearchResult[] = [];

  // Counties / Județe
  for (const c of ALL_COUNTIES) {
    const hay = `${c.name} ${c.id} ${c.slug}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "judet",
        title: c.name,
        url: `/${c.slug}`,
        excerpt: `Sesizări, statistici, hărți pentru ${c.name}`,
        meta: c.id,
      });
    }
  }

  // Static pages
  for (const p of STATIC_PAGES) {
    const hay = `${p.title} ${p.excerpt ?? ""}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push(p);
    }
  }

  // Ghiduri
  for (const g of ghiduri) {
    const hay = `${g.titlu} ${g.descriere}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "ghid",
        title: g.titlu,
        url: `/ghiduri/${g.slug}`,
        excerpt: g.descriere.slice(0, 120),
      });
    }
  }

  // Evenimente
  for (const e of evenimente) {
    const hay = `${e.titlu} ${e.descriere} ${e.county ?? ""}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "eveniment",
        title: e.titlu,
        url: `/evenimente/${e.slug}`,
        excerpt: e.descriere.slice(0, 120),
        meta: e.data,
      });
    }
  }

  // Bilete transport
  for (const b of bilete) {
    const hay = `${b.nume} ${b.descriere} ${b.operator}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "bilet",
        title: `${b.nume} (${b.operator.toUpperCase()})`,
        url: "/bilete",
        excerpt: `${b.pret} lei · ${b.validitate} — ${b.descriere.slice(0, 80)}`,
        meta: b.operator.toUpperCase(),
      });
    }
  }

  // Linii transport
  for (const l of linii) {
    const hay = `${l.numar} ${l.tip} ${l.traseu.join(" ")}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "linie",
        title: `${l.tip.charAt(0).toUpperCase() + l.tip.slice(1)} ${l.numar}`,
        url: "/bilete",
        excerpt: l.traseu.join(" → "),
        meta: `${l.frecventa}`,
      });
    }
  }

  // Primari
  for (const p of primari) {
    const hay = [p.nume, p.partid, ...p.realizari, ...p.controverse].join(" ").toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "primar",
        title: `${p.nume} (${p.partid})`,
        url: "/cum-functioneaza#primari",
        excerpt: `Primar ${p.perioada} — ${p.realizari[0] ?? ""}`.slice(0, 120),
        meta: p.perioada,
      });
    }
  }

  // Direcții PMB
  for (const d of DIRECTII) {
    const hay = [d.name, d.role, ...d.responsabilitati].join(" ").toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "directie",
        title: d.name,
        url: "/cum-functioneaza#structura",
        excerpt: d.role,
        meta: d.contact,
      });
    }
  }

  // Companii municipale
  for (const c of COMPANII) {
    const hay = `${c.name} ${c.rol}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "companie",
        title: c.name,
        url: "/cum-functioneaza#structura",
        excerpt: `${c.rol} · ${c.buget}`,
        meta: `${c.angajati} angajați`,
      });
    }
  }

  // Glosar termeni
  for (const g of GLOSAR) {
    const hay = `${g.term} ${g.shortForm} ${g.definition}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "glosar",
        title: `${g.shortForm} — ${g.term}`,
        url: "/cum-functioneaza#glosar",
        excerpt: g.definition.slice(0, 120),
      });
    }
  }

  // Ghiduri sesizări (tipuri de sesizări)
  for (const sg of SESIZARI_GUIDES) {
    const hay = [sg.label, sg.urgenta, ...sg.tips, ...sg.destinatari].join(" ").toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "ghid-sesizare",
        title: `Sesizare: ${sg.label}`,
        url: `/sesizari?tip=${sg.tip}`,
        excerpt: `${sg.urgenta} · Destinatari: ${sg.destinatari.slice(0, 2).join(", ")}`.slice(0, 120),
        meta: sg.tip,
      });
    }
  }

  // Operatori transport din țară
  for (const [, op] of Object.entries(OPERATORS)) {
    const hay = `${op.name} ${op.coverage} ${op.types.join(" ")} ${op.app ?? ""}`.toLowerCase();
    if (matchesAll(hay, words)) {
      results.push({
        type: "transport",
        title: op.name,
        url: "/bilete",
        excerpt: `${op.coverage} · ${op.types.join(", ")} · ${op.ticketPrice}/călătorie`,
        meta: op.app ?? "",
      });
    }
  }

  // Sesizari (DB) — search each word with OR across columns
  try {
    const supabase = await createSupabaseServer();
    const safeWords = words.map((w) => sanitizeForPostgrest(w)).filter(Boolean);
    // Build OR filter: each word must appear in at least one column
    // Supabase doesn't support AND of ORs easily, so we search the first word and filter in JS
    if (safeWords.length > 0) {
      const first = safeWords[0];
      const { data } = await supabase
        .from("sesizari_feed")
        .select("code, titlu, locatie, sector, status, descriere")
        .or(`titlu.ilike.%${first}%,locatie.ilike.%${first}%,descriere.ilike.%${first}%`)
        .limit(20);
      for (const s of (data ?? []) as Array<{ code: string; titlu: string; locatie: string; sector: string; status: string; descriere: string }>) {
        const hay = `${s.titlu} ${s.locatie} ${s.descriere}`.toLowerCase();
        if (matchesAll(hay, safeWords)) {
          results.push({
            type: "sesizare",
            title: s.titlu,
            url: `/sesizari/${s.code}`,
            excerpt: `${s.locatie}`,
            meta: s.status,
          });
        }
      }
    }
  } catch { /* ignore */ }

  // Stiri (DB) — same word-based approach
  try {
    const supabase = await createSupabaseServer();
    const safeWords = words.map((w) => sanitizeForPostgrest(w)).filter(Boolean);
    if (safeWords.length > 0) {
      const first = safeWords[0];
      const { data } = await supabase
        .from("stiri_cache")
        .select("id, title, excerpt, source")
        .or(`title.ilike.%${first}%,excerpt.ilike.%${first}%`)
        .order("published_at", { ascending: false })
        .limit(10);
      for (const s of (data ?? []) as Array<{ id: string; title: string; excerpt: string; source: string }>) {
        const hay = `${s.title} ${s.excerpt ?? ""}`.toLowerCase();
        if (matchesAll(hay, safeWords)) {
          results.push({
            type: "stire",
            title: s.title,
            url: `/stiri/${s.id}`,
            excerpt: s.excerpt?.slice(0, 120) ?? "",
            meta: s.source,
          });
        }
      }
    }
  } catch { /* ignore */ }

  return NextResponse.json(
    { data: results.slice(0, 30) },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
