import { getGroqClient, GROQ_MODEL_FAST } from "@/lib/groq/client";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export interface SummarizablePetitie {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  category: string | null;
  ai_summary: string | null;
}

const SYSTEM_PROMPT = `Ești un analist civic care sintetizează petiții pentru o platformă civică din România (Civia).

INSTRUCȚIUNI DE FORMATARE:
- Folosește markdown: **bold** pentru cifre + nume + termene importante; secțiuni cu titlu pe linie separată terminat cu ":".
- Începe cu un paragraf "Pe scurt" (1–2 propoziții) — esența cererii și beneficiarul.
- Apoi secțiunea "Ce cere petiția:" cu o listă de bullet-uri scurte (cu "- ").
- Apoi "De ce contează:" — 2–3 propoziții cu impactul concret asupra cetățenilor.
- Dacă din text rezultă un termen / o lege / un articol legal, evidențiază-l cu **bold**.
- Dacă există un public-țintă specific (părinți, șoferi, pacienți etc.), menționează-l clar.
- Tonul: factual, civic, fără sloganuri sau retorică. Limba română corectă cu diacritice.
- Lungime totală: 200–350 cuvinte.
- NU inventa fapte. Dacă o secțiune nu poate fi compusă din text, omite-o.
- NU repeta titlul cuvânt cu cuvânt în primul paragraf.`;

// Per-instance request coalescing — same lambda, same petition: one call.
const inFlight = new Map<string, Promise<string | null>>();

/**
 * Returns the cached AI synthesis if present, otherwise generates one,
 * persists it to the DB, and returns it. Mirrors getOrGenerateAiSummary
 * for stiri.
 */
export async function getOrGeneratePetitieAiSummary(
  petitie: SummarizablePetitie,
): Promise<string | null> {
  if (petitie.ai_summary && petitie.ai_summary.length > 20) {
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

async function generate(
  petitie: SummarizablePetitie,
  rawText: string,
): Promise<string | null> {
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL_FAST,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Sintetizează această petiție civică${petitie.category ? ` (categorie: ${petitie.category})` : ""}:\n\n${rawText.slice(0, 4000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 900,
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? "";
    if (summary.length <= 20) {
      return petitie.summary || petitie.body || petitie.title || null;
    }

    try {
      const admin = createSupabaseAdmin();
      await admin
        .from("petitii")
        .update({ ai_summary: summary })
        .eq("id", petitie.id)
        .is("ai_summary", null);
    } catch {
      // Best-effort; next request will retry the persist.
    }

    return summary;
  } catch {
    return petitie.summary || petitie.body || petitie.title || null;
  }
}
