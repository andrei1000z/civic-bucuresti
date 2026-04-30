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
      max_tokens: 1200,
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
