import * as Sentry from "@sentry/nextjs";
import { getGroqClient, GROQ_MODEL, GROQ_MODEL_FAST } from "@/lib/groq/client";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { polishSynthesis } from "@/lib/ai/polish-synthesis";
import { AI_SUMMARY_VERSION } from "@/lib/ai/synthesis-version";

export interface SummarizablePetitie {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  category: string | null;
  ai_summary: string | null;
  /** Version stamp written alongside `ai_summary`. When < AI_SUMMARY_VERSION
   *  we regenerate transparently so quality fixes propagate. */
  ai_summary_version?: number | null;
}

const SYSTEM_PROMPT = `Ești un analist civic senior care sintetizează petiții pentru Civia, o platformă civică românească cu standarde editoriale înalte.

CORECTITUDINE GRAMATICALĂ — OBLIGATORIE:
- Limba română corectă, cu diacritice complete (ă, â, î, ș, ț) — fără excepții.
- Acord perfect: subiect–predicat (numerice incluse: „două instituții sunt", nu „este"), articol hotărât/nehotărât, gen + număr la adjective.
- Folosește articulat corect: „primarul Bucureștiului", „ministrul Sănătății".
- Cifrele cu separatorul corect românesc (80.000 nu 80,000).
- Numele proprii și instituțiile cu majusculă: „Primăria Capitalei", „Curtea Constituțională".

STRUCTURĂ — RESPECTĂ EXACT (fiecare titlu pe linie separată terminat cu „:")

1. „Pe scurt:" — 2–3 propoziții cu esența cererii și beneficiarul. NU repeta titlul cuvânt cu cuvânt.

2. „Ce cere petiția:" — listă de 3–6 bullet-uri cu „- ", una cerere per bullet, fiecare începând cu majusculă. Fiecare bullet e auto-suficient și conține un verb la imperativ („Adoptarea…", „Modificarea…", „Stoparea…").

3. „Cifre & date cheie:" — listă de 2–5 bullet-uri cu „- " conținând cifre concrete, termene, articole de lege, instituții implicate, geografie (toate pe **bold**). Omite secțiunea complet dacă petiția nu menționează cifre concrete; nu inventa.

4. „Context:" — 2–3 propoziții cu fundalul (ce s-a întâmplat înainte, ce lege e implicată, cine sunt actorii). Cititorul trebuie să înțeleagă subiectul fără să fi urmărit știri pe tema respectivă.

5. „De ce contează:" — 2–3 propoziții despre impactul concret pentru cetățeni (cine e afectat, cum, când). Obligatorie.

FORMATARE:
- Prima literă din fiecare paragraf, bullet și secțiune E ÎNTOTDEAUNA majusculă.
- **Bold** pe cifre, termene, articole de lege („Legea 544/2001"), public-țintă, instituții.
- Tonul: factual, civic, fără sloganuri sau retorică.

INTERZIS:
- NU inventa fapte, cifre sau termene care nu sunt în textul sursă.
- Dacă o secțiune nu poate fi compusă din text (în special „Cifre & date cheie"), omite-o complet.
- NU folosi emoji-uri sau adjective evaluative.

LUNGIME: 250–380 cuvinte total — un brief structurat, nu un rezumat scurt.`;

const inFlight = new Map<string, Promise<string | null>>();

/**
 * Returns the cached AI synthesis if present AND at the current version,
 * otherwise generates one, persists it, and returns it.
 */
export async function getOrGeneratePetitieAiSummary(
  petitie: SummarizablePetitie,
): Promise<string | null> {
  const cacheValid =
    petitie.ai_summary &&
    petitie.ai_summary.length > 20 &&
    (petitie.ai_summary_version ?? 0) >= AI_SUMMARY_VERSION;

  if (cacheValid) {
    return petitie.ai_summary;
  }

  const existing = inFlight.get(petitie.id);
  if (existing) return existing;

  const rawText = [petitie.title, petitie.summary, petitie.body]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  if (rawText.length < 30) {
    return petitie.summary || petitie.title || null;
  }

  const promise = generate(petitie, rawText);
  inFlight.set(petitie.id, promise);
  try {
    return await promise;
  } finally {
    setTimeout(() => inFlight.delete(petitie.id), 0);
  }
}

/** True for Groq 429 (rate limit / token budget exhausted). Mirrors
 *  the same helper in lib/stiri/ai-summary.ts. */
function isRateLimited(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  if (e.status === 429) return true;
  return typeof e.message === "string" && /rate.?limit|429/i.test(e.message);
}

/**
 * Same model-fallback pattern as stiri: try the strict-grammar 70B
 * model first, fall back to the faster 8B when 70B is rate-limited.
 * Without this, every 70B 429 made the petition page silently render
 * the original `summary` field instead of the structured 5-section
 * brief — that was the symptom that caused the v4 schema to look
 * "broken" in production after the prompt upgrade.
 */
async function callGroqWithFallback(
  prompt: string,
  rawText: string,
  petitie: SummarizablePetitie,
): Promise<string | null> {
  const groq = getGroqClient();
  const userMsg = `Sintetizează această petiție civică${petitie.category ? ` (categorie: ${petitie.category})` : ""}:\n\n${rawText.slice(0, 4000)}`;
  const messages = [
    { role: "system" as const, content: prompt },
    { role: "user" as const, content: userMsg },
  ];

  const candidates = [
    { model: GROQ_MODEL, max_tokens: 1200 },
    { model: GROQ_MODEL_FAST, max_tokens: 1200 },
  ];

  for (const cand of candidates) {
    try {
      const completion = await groq.chat.completions.create({
        model: cand.model,
        messages,
        temperature: 0.2,
        max_tokens: cand.max_tokens,
      });
      return completion.choices[0]?.message?.content?.trim() ?? null;
    } catch (err) {
      if (isRateLimited(err) && cand.model !== GROQ_MODEL_FAST) {
        Sentry.captureMessage("petitii AI fell back to fast model (70B 429)", {
          level: "info",
          tags: { kind: "petitii_ai_fallback" },
          extra: { petitieId: petitie.id, fromModel: cand.model, toModel: GROQ_MODEL_FAST },
        });
        continue;
      }
      throw err;
    }
  }
  return null;
}

async function generate(
  petitie: SummarizablePetitie,
  rawText: string,
): Promise<string | null> {
  try {
    const raw = await callGroqWithFallback(SYSTEM_PROMPT, rawText, petitie);
    if (!raw || raw.length <= 20) {
      Sentry.captureMessage("petitii AI summary too short or empty", {
        level: "warning",
        tags: { kind: "petitii_ai_short" },
        extra: { petitieId: petitie.id, rawLength: raw?.length ?? 0 },
      });
      return petitie.summary || petitie.body || petitie.title || null;
    }
    const summary = polishSynthesis(raw);

    try {
      const admin = createSupabaseAdmin();
      const { error: dbErr } = await admin
        .from("petitii")
        .update({ ai_summary: summary, ai_summary_version: AI_SUMMARY_VERSION })
        .eq("id", petitie.id);
      if (dbErr) {
        Sentry.captureException(dbErr, {
          tags: { kind: "petitii_ai_persist" },
          extra: { petitieId: petitie.id },
        });
      }
    } catch (persistErr) {
      Sentry.captureException(persistErr, {
        tags: { kind: "petitii_ai_persist" },
        extra: { petitieId: petitie.id },
      });
    }

    return summary;
  } catch (err) {
    // Surface the real reason (Groq error, network timeout, etc.) so
    // we stop silently falling back to the petition's plain summary
    // without anyone noticing in production.
    Sentry.captureException(err, {
      tags: { kind: "petitii_ai_generate" },
      extra: {
        petitieId: petitie.id,
        rawTextLength: rawText.length,
      },
    });
    return petitie.summary || petitie.body || petitie.title || null;
  }
}
