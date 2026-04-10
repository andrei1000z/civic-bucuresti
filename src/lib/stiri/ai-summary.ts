import { getGroqClient, GROQ_MODEL_FAST } from "@/lib/groq/client";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export interface SummarizableStire {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  source: string;
  ai_summary: string | null;
}

const SYSTEM_PROMPT = `Ești un jurnalist profesionist care sintetizează știri pentru o platformă civică din România (Civia).

INSTRUCȚIUNI:
- Rescrie articolul într-un format clar, structurat, ușor de citit
- Folosește paragrafe scurte (2-3 propoziții fiecare)
- Începe cu cel mai important fapt (piramida inversată)
- Extrage și evidențiază: cifre, date, nume de persoane, instituții
- Adaugă context dacă e necesar (ce lege, ce instituție, de ce contează)
- Tonul: obiectiv, informativ, fără sensaționalism
- Scrie în română cu diacritice corecte
- NU inventa informații care nu sunt în textul original
- Lungime: 150-300 de cuvinte
- La final, adaugă o secțiune "De ce contează" cu 1-2 propoziții despre relevanța pentru cetățeni`;

// Per-instance request coalescing: if the same serverless lambda handles N
// concurrent requests for the same uncached article, they share a single
// Groq call. Cross-instance coalescing happens at the DB level (first write wins).
const inFlight = new Map<string, Promise<string | null>>();

/**
 * Returns the cached AI summary if present, otherwise generates one,
 * persists it synchronously to the DB, and returns it.
 *
 * Safe to call from server components, API routes, or cron jobs.
 * Concurrent calls for the same stire within one lambda are coalesced into
 * a single Groq request.
 */
export async function getOrGenerateAiSummary(
  stire: SummarizableStire
): Promise<string | null> {
  if (stire.ai_summary && stire.ai_summary.length > 20) {
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
    // Drop the entry a short tick after resolution so subsequent identical
    // requests still benefit from DB caching (which is authoritative).
    setTimeout(() => inFlight.delete(stire.id), 0);
  }
}

async function generate(
  stire: SummarizableStire,
  rawText: string
): Promise<string | null> {
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL_FAST,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Sintetizează acest articol de la ${stire.source}:\n\n${rawText.slice(0, 3000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? "";
    if (summary.length <= 20) {
      return stire.excerpt || stire.content || stire.title || null;
    }

    // Persist with await — subsequent DB reads from ANY instance will see it.
    // Use a conditional update so the first successful writer wins; others noop.
    try {
      const admin = createSupabaseAdmin();
      await admin
        .from("stiri_cache")
        .update({ ai_summary: summary })
        .eq("id", stire.id)
        .is("ai_summary", null);
    } catch {
      // Persisting is best-effort — the generation itself is still useful
      // for the current request. Next request will retry.
    }

    return summary;
  } catch {
    return stire.excerpt || stire.content || stire.title || null;
  }
}
