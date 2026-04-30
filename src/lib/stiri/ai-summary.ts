import * as Sentry from "@sentry/nextjs";
import { getGroqClient, GROQ_MODEL, GROQ_MODEL_FAST } from "@/lib/groq/client";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { polishSynthesis } from "@/lib/ai/polish-synthesis";
import { AI_SUMMARY_VERSION } from "@/lib/ai/synthesis-version";

export interface SummarizableStire {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  source: string;
  ai_summary: string | null;
  /** Version stamp written alongside `ai_summary`. When < AI_SUMMARY_VERSION
   *  we regenerate transparently so quality fixes propagate. */
  ai_summary_version?: number | null;
}

const SYSTEM_PROMPT = `Ești un jurnalist senior român care scrie pentru Civia, o platformă civică serioasă, de standarde editoriale înalte.

CORECTITUDINE GRAMATICALĂ — OBLIGATORIE:
- Limba română corectă, cu diacritice complete (ă, â, î, ș, ț) — fără excepții.
- Acord perfect: subiect–predicat (numerice incluse: „doi cetățeni au fost", nu „a fost"), articol hotărât/nehotărât, gen + număr la adjective.
- Folosește articulat corect: „primarul Bucureștiului" (nu „primarul București"), „ministrul Educației" etc.
- Numele proprii și instituțiile cu majusculă: „Primăria Capitalei", „Curtea Constituțională", „Ministerul Sănătății".
- Cifrele cu separatorul corect românesc (50.000 nu 50,000).
- Fără calcuri din engleză.

STRUCTURĂ — RESPECTĂ EXACT (fiecare titlu pe linie separată terminat cu „:")

1. „Pe scurt:" — 2–3 propoziții care surprind ESENȚIAL faptul. NU repeta titlul cuvânt cu cuvânt.

2. „Cifre cheie:" — listă de 3–5 bullet-uri cu „- ", fiecare începe cu majusculă, fiecare conține o cifră / un nume / un termen legal pus pe **bold**. Omite secțiunea dacă articolul nu are cifre concrete; nu inventa.

3. „Context:" — 2–3 propoziții cu fundalul (ce s-a întâmplat înainte, ce lege se aplică, cine sunt actorii). Cititorul trebuie să înțeleagă povestea fără să fi urmărit subiectul.

4. „Ce urmează:" — 1–2 propoziții cu pașii imediat următori (vot, decizie, deadline). Omite dacă articolul nu menționează nimic; nu specula.

5. „De ce contează:" — 1–2 propoziții despre impactul concret pentru cetățeni (cine e afectat, cum, când). Obligatorie.

FORMATARE:
- Prima literă din fiecare paragraf, bullet și secțiune E ÎNTOTDEAUNA majusculă.
- **Bold** doar pe cifre, nume proprii, instituții, termene legale.
- Tonul: factual, civic, fără sloganuri.

INTERZIS:
- NU inventa cifre, nume sau date care nu sunt în textul original.
- Dacă o cifră lipsește din sursă, scrie „nepublicat" — nu plasa o estimare.
- NU repeta titlul cuvânt cu cuvânt în „Pe scurt".
- NU folosi emoji-uri sau adjective evaluative („incredibil", „șocant", „dramatic").

LUNGIME: 250–380 de cuvinte (mai mult decât un simplu rezumat — un brief structurat).`;

const inFlight = new Map<string, Promise<string | null>>();

/**
 * Returns the cached AI summary if present AND at the current version,
 * otherwise generates a new one, persists it, and returns it.
 *
 * Concurrent calls for the same stire within one lambda are coalesced
 * into a single Groq request.
 */
export async function getOrGenerateAiSummary(
  stire: SummarizableStire
): Promise<string | null> {
  const cacheValid =
    stire.ai_summary &&
    stire.ai_summary.length > 20 &&
    (stire.ai_summary_version ?? 0) >= AI_SUMMARY_VERSION;

  if (cacheValid) {
    return stire.ai_summary;
  }

  const existing = inFlight.get(stire.id);
  if (existing) return existing;

  const rawText = [stire.title, stire.excerpt, stire.content]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  if (rawText.length < 30) {
    return stire.excerpt || stire.title || null;
  }

  const promise = generate(stire, rawText);
  inFlight.set(stire.id, promise);
  try {
    return await promise;
  } finally {
    setTimeout(() => inFlight.delete(stire.id), 0);
  }
}

/** True for Groq 429 (rate limit / token budget exhausted). */
function isRateLimited(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  if (e.status === 429) return true;
  return typeof e.message === "string" && /rate.?limit|429/i.test(e.message);
}

async function callGroqWithFallback(
  prompt: string,
  rawText: string,
  source: string,
): Promise<{ raw: string; modelUsed: string } | null> {
  const groq = getGroqClient();
  const userMsg = `Sintetizează acest articol de la ${source}:\n\n${rawText.slice(0, 3000)}`;
  const messages = [
    { role: "system" as const, content: prompt },
    { role: "user" as const, content: userMsg },
  ];

  // First try the strict-grammar 70B model. Falls back to the
  // faster/cheaper 8B-instant when 70B is rate-limited (Groq free
  // tier caps 70B at 100K tokens/day; 8B has a much larger daily
  // budget). The polishSynthesis post-processor smooths over the
  // grammar quality gap.
  const candidates: { model: string; max_tokens: number }[] = [
    { model: GROQ_MODEL, max_tokens: 900 },
    { model: GROQ_MODEL_FAST, max_tokens: 900 },
  ];

  for (const cand of candidates) {
    try {
      const completion = await groq.chat.completions.create({
        model: cand.model,
        messages,
        temperature: 0.2,
        max_tokens: cand.max_tokens,
      });
      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      return { raw, modelUsed: cand.model };
    } catch (err) {
      if (isRateLimited(err) && cand.model !== GROQ_MODEL_FAST) {
        Sentry.captureMessage("stiri AI fell back to fast model (70B 429)", {
          level: "info",
          tags: { kind: "stiri_ai_fallback" },
          extra: { source, fromModel: cand.model, toModel: GROQ_MODEL_FAST },
        });
        continue; // try the fast model
      }
      // Non-429 error or both models rate-limited — bubble up.
      throw err;
    }
  }
  return null;
}

async function generate(
  stire: SummarizableStire,
  rawText: string
): Promise<string | null> {
  try {
    const result = await callGroqWithFallback(SYSTEM_PROMPT, rawText, stire.source);
    if (!result) {
      return stire.excerpt || stire.content || stire.title || null;
    }
    const { raw } = result;
    if (raw.length <= 20) {
      Sentry.captureMessage("stiri AI summary returned too-short response", {
        level: "warning",
        tags: { kind: "stiri_ai_short" },
        extra: { stireId: stire.id, source: stire.source, rawLength: raw.length },
      });
      return stire.excerpt || stire.content || stire.title || null;
    }
    const summary = polishSynthesis(raw);

    // Persist with await — stamps the version so the cache check above
    // recognises this row as current. Subsequent reads from any
    // instance see it.
    try {
      const admin = createSupabaseAdmin();
      const { error: dbErr } = await admin
        .from("stiri_cache")
        .update({ ai_summary: summary, ai_summary_version: AI_SUMMARY_VERSION })
        .eq("id", stire.id);
      if (dbErr) {
        Sentry.captureException(dbErr, {
          tags: { kind: "stiri_ai_persist" },
          extra: { stireId: stire.id, source: stire.source },
        });
      }
    } catch (persistErr) {
      Sentry.captureException(persistErr, {
        tags: { kind: "stiri_ai_persist" },
        extra: { stireId: stire.id, source: stire.source },
      });
    }

    return summary;
  } catch (err) {
    // Surface the real reason (Groq rate limit, network timeout, model
    // rejection, etc.) so we stop silently falling back to the article
    // excerpt without anyone noticing in production.
    Sentry.captureException(err, {
      tags: { kind: "stiri_ai_generate" },
      extra: {
        stireId: stire.id,
        source: stire.source,
        model: GROQ_MODEL,
        rawTextLength: rawText.length,
      },
    });
    return stire.excerpt || stire.content || stire.title || null;
  }
}
