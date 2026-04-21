import { getGroqClient, GROQ_MODEL_FAST } from "@/lib/groq/client";

export interface PolishInput {
  titlu: string;
  descriere: string;
  locatie: string;
  tip?: string;
}

export interface PolishResult {
  titlu: string;
  descriere: string;
  locatie: string;
}

const SYSTEM_PROMPT = `Ești un editor de conținut pentru o platformă civică românească. Primești titlul, descrierea și locația scrise de un cetățean, adesea în grabă (ALL CAPS, fără diacritice, scurt și imperativ). Trebuie să le normalizezi în format public publicabil.

REGULI:
1. TITLU — max 80 caractere, Sentence case (prima literă mare, restul minuscule cu excepția numelor proprii), diacritice corecte, formulare neutră/descriptivă. NU imperativ ("SĂ FACĂ X"), ci descriptiv ("Mașini parcate pe trotuar — necesar stâlpișori anti-parcare").
2. DESCRIERE — 1-3 propoziții concise, formale, diacritice, Sentence case. Reformulează imperativul în constatare. Elimină repetițiile.
3. LOCAȚIE — capitalizează corect numele proprii (Calea 13 Septembrie, Șoseaua Panduri, Strada Mihail Cioranu), păstrează detaliile importante, rescrie fluent și scurt (sub 200 caractere).

RĂSPUNDE DOAR CU JSON VALID în formatul:
{"titlu": "...", "descriere": "...", "locatie": "..."}

Nu adăuga text înainte/după. Nu folosi markdown. Păstrează toate informațiile factuale (nume străzi, numere, referințe la bănci/clădiri).`;

/**
 * Takes raw user-entered sesizare fields and returns a publish-ready
 * version: proper case, diacritics, descriptive title, concise description,
 * well-formatted location. Uses the fast Groq model — this isn't the formal
 * letter, just surface polish. If the AI call fails, returns the input
 * unchanged.
 */
export async function polishSesizare(input: PolishInput): Promise<PolishResult> {
  const fallback: PolishResult = {
    titlu: input.titlu,
    descriere: input.descriere,
    locatie: input.locatie,
  };
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL_FAST,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            input.tip ? `Tip problemă: ${input.tip}` : "",
            `TITLU BRUT: ${input.titlu}`,
            `DESCRIERE BRUTĂ: ${input.descriere}`,
            `LOCAȚIE BRUTĂ: ${input.locatie}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) return fallback;
    const parsed = JSON.parse(content) as Partial<PolishResult>;
    return {
      titlu: (parsed.titlu || fallback.titlu).trim().slice(0, 200),
      descriere: (parsed.descriere || fallback.descriere).trim().slice(0, 2000),
      locatie: (parsed.locatie || fallback.locatie).trim().slice(0, 300),
    };
  } catch {
    return fallback;
  }
}
