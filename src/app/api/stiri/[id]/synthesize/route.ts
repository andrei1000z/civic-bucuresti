import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getGroqClient, GROQ_MODEL_FAST } from "@/lib/groq/client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * GET /api/stiri/[id]/synthesize
 * Returns AI-synthesized version of a news article.
 * Cached in stiri_cache.ai_summary column after first generation.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch the article
  const { data: stire } = await supabase
    .from("stiri_cache")
    .select("id, title, excerpt, content, source, category, ai_summary")
    .eq("id", id)
    .maybeSingle();

  if (!stire) {
    return NextResponse.json({ error: "Știrea nu a fost găsită" }, { status: 404 });
  }

  // Return cached AI summary if exists
  if (stire.ai_summary) {
    return NextResponse.json(
      { data: { summary: stire.ai_summary } },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
    );
  }

  // Generate AI synthesis
  const rawText = [stire.title, stire.excerpt, stire.content]
    .filter(Boolean)
    .join("\n\n");

  if (rawText.length < 30) {
    return NextResponse.json({
      data: { summary: stire.excerpt || stire.title },
    });
  }

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL_FAST,
      messages: [
        {
          role: "system",
          content: `Ești un jurnalist profesionist care sintetizează știri pentru o platformă civică din România (Civia).

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
- La final, adaugă o secțiune "De ce contează" cu 1-2 propoziții despre relevanța pentru cetățeni`,
        },
        {
          role: "user",
          content: `Sintetizează acest articol de la ${stire.source}:\n\n${rawText.slice(0, 3000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const summary = completion.choices[0]?.message?.content ?? "";

    // Cache the AI summary in DB (fire-and-forget, ignore errors)
    if (summary.length > 20) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      adminClient
        .from("stiri_cache")
        .update({ ai_summary: summary })
        .eq("id", id)
        .then(() => {/* cached */});
    }

    return NextResponse.json(
      { data: { summary } },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
    );
  } catch (e) {
    console.error("Groq synthesis error:", e);
    // Fallback to original text
    return NextResponse.json({
      data: { summary: stire.excerpt || stire.content || stire.title },
    });
  }
}
