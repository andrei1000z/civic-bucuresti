import { getGroqClient, GROQ_MODEL } from "@/lib/groq/client";
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
- Cifrele cu separatorul corect românesc (50.000 nu 50,000); procente cu spațiu non-breaking dacă posibil.
- Fără calcuri din engleză: nu „a fost asociat cu" cu sens de „a fost legat de".

FORMATARE:
- Prima literă din fiecare paragraf E ÎNTOTDEAUNA majusculă.
- Paragrafe scurte (2–3 propoziții), separate prin linie goală.
- Pune **bold** pe cifre, nume proprii, termene legale și instituții.
- Începe cu cel mai important fapt (piramida inversată).
- Adaugă o secțiune pe linie separată „De ce contează:" la final, cu 1–2 propoziții despre relevanța pentru cetățeni.

INTERZIS:
- NU inventa informații, cifre, nume sau date care nu sunt în textul original.
- Dacă o cifră lipsește din sursă, scrie „nepublicat" sau „nu a fost comunicat" — nu plasa o estimare.
- NU repeta titlul cuvânt cu cuvânt în primul paragraf.
- NU folosi emoji-uri, exclamări senzaționaliste sau adjective evaluative („incredibil", „șocant").

LUNGIME: 150–280 de cuvinte.`;

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

async function generate(
  stire: SummarizableStire,
  rawText: string
): Promise<string | null> {
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Sintetizează acest articol de la ${stire.source}:\n\n${rawText.slice(0, 3000)}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (raw.length <= 20) {
      return stire.excerpt || stire.content || stire.title || null;
    }
    const summary = polishSynthesis(raw);

    // Persist with await — stamps the version so the cache check above
    // recognises this row as current. Subsequent reads from any
    // instance see it.
    try {
      const admin = createSupabaseAdmin();
      await admin
        .from("stiri_cache")
        .update({ ai_summary: summary, ai_summary_version: AI_SUMMARY_VERSION })
        .eq("id", stire.id);
    } catch {
      // Persisting is best-effort; the generation itself is still useful
      // for the current request. Next request will retry.
    }

    return summary;
  } catch {
    return stire.excerpt || stire.content || stire.title || null;
  }
}
