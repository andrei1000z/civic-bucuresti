import * as Sentry from "@sentry/nextjs";
import { getGroqClient, GROQ_MODEL, GROQ_MODEL_FAST } from "@/lib/groq/client";
import { callGemini, isGeminiConfigured, GEMINI_MODEL, GEMINI_MODEL_FAST } from "@/lib/ai/gemini";
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

const SYSTEM_PROMPT = `Ești un jurnalist senior român care scrie pentru Civia, o platformă civică serioasă, de standarde editoriale înalte. Sinteza ta nu e un rezumat — e o reorganizare a faptelor cu valoare adăugată: structură scanabilă, context legal/instituțional, impact pentru cetățean.

VALOAREA ADĂUGATĂ E NEGOCIABILĂ. Cititorul a venit la Civia, nu la sursa originală, pentru că vrea CEVA ÎN PLUS:
- Structură clară, scanabilă în 30 secunde.
- Cifrele extrase și evidențiate (nu pierdute în text).
- Contextul instituțional / legal explicat scurt (cine ce poate, ce lege se aplică).
- Implicația pentru un cetățean obișnuit (cine e afectat, cum, când).

Dacă sinteza ta arată identic cu excerpt-ul original, ai eșuat. REORGANIZEAZĂ informația.

CORECTITUDINE GRAMATICALĂ — OBLIGATORIE:
- Limba română corectă, cu diacritice complete (ă, â, î, ș, ț) — fără excepții.
- Acord perfect: subiect–predicat (numerice incluse: „doi cetățeni au fost", nu „a fost"), articol hotărât/nehotărât, gen + număr la adjective.
- Folosește articulat corect: „primarul Bucureștiului" (nu „primarul București"), „ministrul Educației" etc.
- Numele proprii și instituțiile cu majusculă: „Primăria Capitalei", „Curtea Constituțională", „Ministerul Sănătății".
- Cifrele cu separatorul corect românesc (50.000 nu 50,000).
- Fără calcuri din engleză.

STRUCTURĂ — RESPECTĂ EXACT (fiecare titlu pe linie separată terminat cu „:")

1. „Pe scurt:" — 2–3 propoziții care surprind ESENȚIAL faptul, REFORMULAT. NU repeta titlul sau excerpt-ul cuvânt cu cuvânt; reformulează cu altă structură de propoziție.

2. „Cifre cheie:" — listă de 3–5 bullet-uri cu „- ", fiecare începe cu majusculă, fiecare conține o cifră / un nume / un termen legal pus pe **bold**. Omite secțiunea dacă articolul chiar nu are cifre concrete; nu inventa. Pentru articole fără cifre, sari direct la „Context".

3. „Context:" — 2–3 propoziții cu fundalul (ce s-a întâmplat înainte, ce lege se aplică, cine sunt actorii și ce rol au, ce instituție decide). Cititorul trebuie să înțeleagă povestea fără să fi urmărit subiectul. Dacă sursa nu dă context explicit, dedu din cunoștințele generale (NATO, instituții UE, legi românești) — dar fără să inventezi cifre sau evenimente specifice.

4. „Ce urmează:" — 1–2 propoziții cu pașii imediat următori (vot, decizie, deadline, sesiune parlamentară etc.). Omite dacă articolul nu menționează nimic concret; nu specula data.

5. „De ce contează:" — 1–2 propoziții despre impactul concret pentru cetățeni (cine e afectat, cum, când). OBLIGATORIE — chiar și pentru articole de politică externă, leagă de cetățean (taxe, drepturi, securitate, costuri, libertăți).

FORMATARE:
- Prima literă din fiecare paragraf, bullet și secțiune E ÎNTOTDEAUNA majusculă.
- **Bold** doar pe cifre, nume proprii, instituții, termene legale.
- Tonul: factual, civic, fără sloganuri.

INTERZIS:
- NU inventa cifre, nume sau date care nu sunt în textul original.
- Dacă o cifră lipsește din sursă, scrie „nepublicat" — nu plasa o estimare.
- NU repeta titlul sau excerpt-ul cuvânt cu cuvânt — reformulează.
- NU folosi emoji-uri sau adjective evaluative („incredibil", „șocant", „dramatic").
- NU produce o sinteză identică cu excerpt-ul original. E inutilă.

LUNGIME: 200–400 de cuvinte. Pentru articole foarte scurte (excerpt < 300 caractere), scoate cel puțin „Pe scurt" + „Context" + „De ce contează" — chiar și pe input puțin, structura adaugă valoare.`;

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

async function callAiWithFallback(
  prompt: string,
  rawText: string,
  source: string,
): Promise<{ raw: string; modelUsed: string } | null> {
  const userMsg = `Sintetizează acest articol de la ${source}:\n\n${rawText.slice(0, 3000)}`;
  const messages = [
    { role: "system" as const, content: prompt },
    { role: "user" as const, content: userMsg },
  ];

  // Multi-provider chain. Order matches /api/ai/improve:
  //   1. Gemini 2.5 Flash       (separate quota from Groq)
  //   2. Gemini 2.5 Flash Lite  (separate per-model Gemini counter)
  //   3. Groq Llama 3.3 70B
  //   4. Groq Llama 3.1 8B-instant
  // Gemini goes first because Groq's free 70B daily token budget
  // exhausts fast — when that happens, the previous chain (Groq-only)
  // dropped straight to the article excerpt as "summary", which is
  // why users were seeing "Sinteză Civia" identical to the excerpt
  // below it. Gemini 2.5 Flash has 1500 RPD on free tier, plenty for
  // a synthesis use-case. The polishSynthesis post-processor smooths
  // over any grammar gap between providers.
  type Candidate = {
    provider: "gemini" | "groq";
    model: string;
    run: () => Promise<string>;
  };
  const groq = getGroqClient();
  const groqCall = (model: string, max_tokens: number) => async (): Promise<string> => {
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
      max_tokens,
    });
    return completion.choices[0]?.message?.content?.trim() ?? "";
  };
  const geminiCall = (model: string) => async (): Promise<string> => {
    // Gemini 2.5 Flash uses internal "thinking" tokens that count
    // against max_tokens. 4000 leaves comfortable room for both
    // thinking + the structured 250-380 word output.
    const out = await callGemini({
      messages,
      model,
      temperature: 0.2,
      max_tokens: 4000,
    });
    return (out ?? "").trim();
  };
  const candidates: Candidate[] = [
    ...(isGeminiConfigured()
      ? [
          { provider: "gemini" as const, model: GEMINI_MODEL, run: geminiCall(GEMINI_MODEL) },
          { provider: "gemini" as const, model: GEMINI_MODEL_FAST, run: geminiCall(GEMINI_MODEL_FAST) },
        ]
      : []),
    { provider: "groq" as const, model: GROQ_MODEL, run: groqCall(GROQ_MODEL, 900) },
    { provider: "groq" as const, model: GROQ_MODEL_FAST, run: groqCall(GROQ_MODEL_FAST, 900) },
  ];

  // Minimum chars we'll accept as a "real" synthesis. Below this it's
  // either an empty response (Gemini safety-filtered, thinking-only,
  // or truncated mid-output), so we treat it as a failure and try
  // the next provider instead of returning it as success.
  const MIN_LEN = 80;

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i]!;
    const isLast = i === candidates.length - 1;
    try {
      const raw = await cand.run();
      if (raw && raw.length >= MIN_LEN) {
        return { raw, modelUsed: `${cand.provider}:${cand.model}` };
      }
      // Empty / too-short response: log + try next provider.
      // Common causes: Gemini safety-filtered the prompt (politics,
      // sensitive content), Gemini 2.5 spent all its max_tokens on
      // thinking and emitted nothing, or the model truncated mid-
      // output. Either way, we don't want to "succeed" with garbage.
      if (!isLast) {
        const next = candidates[i + 1]!;
        Sentry.captureMessage("stiri AI returned empty/short response, falling back", {
          level: "info",
          tags: { kind: "stiri_ai_fallback_empty" },
          extra: {
            source,
            fromProvider: cand.provider,
            fromModel: cand.model,
            toProvider: next.provider,
            toModel: next.model,
            rawLength: raw?.length ?? 0,
          },
        });
        continue;
      }
      // Last candidate also returned nothing — return what we have so
      // the caller can decide what to do (generate() will fall back
      // to excerpt at this point).
      return { raw: raw ?? "", modelUsed: `${cand.provider}:${cand.model}` };
    } catch (err) {
      if (isRateLimited(err) && !isLast) {
        const next = candidates[i + 1]!;
        Sentry.captureMessage("stiri AI fell back to next provider (429)", {
          level: "info",
          tags: { kind: "stiri_ai_fallback" },
          extra: {
            source,
            fromProvider: cand.provider,
            fromModel: cand.model,
            toProvider: next.provider,
            toModel: next.model,
          },
        });
        continue;
      }
      // Non-rate-limit error — also try the next provider rather than
      // crashing. Network blips, timeouts, malformed responses all
      // get a second chance.
      if (!isLast) {
        const next = candidates[i + 1]!;
        Sentry.captureMessage("stiri AI threw, falling back to next provider", {
          level: "warning",
          tags: { kind: "stiri_ai_fallback_error" },
          extra: {
            source,
            fromProvider: cand.provider,
            fromModel: cand.model,
            toProvider: next.provider,
            toModel: next.model,
            errorMessage: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
          },
        });
        continue;
      }
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
    const result = await callAiWithFallback(SYSTEM_PROMPT, rawText, stire.source);
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
