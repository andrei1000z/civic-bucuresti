import { NextResponse } from "next/server";
import { z } from "zod";
import { getGroqClient, GROQ_MODEL, GROQ_MODEL_VISION } from "@/lib/groq/client";
import { SYSTEM_PROMPT_FORMAL } from "@/lib/groq/prompts";
import { getTemplate } from "@/lib/groq/templates";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const schema = z.object({
  descriere: z.string().min(5).max(2000),
  tip: z.string().optional(),
  locatie: z.string().optional(),
  nume: z.string().optional(),
  adresa: z.string().optional(),
  // Photo URLs from Supabase storage. When present, we route to the vision
  // model so the AI can refine the description based on what's actually in
  // the frame (e.g., "sidewalk is wide, pedestrians have room" — not
  // hallucinated "forced onto the road").
  imagini: z.array(z.string().url()).max(5).optional(),
});

interface AIResponse {
  formal_text: string;
  descriere_rafinata?: string;
}

// Max 5 photos to keep payload + latency sane. Groq vision accepts up to
// ~20MB of image data per request.
const MAX_PHOTOS = 5;

// Keywords that mark paragraph starts in our formal template
const PARAGRAPH_STARTS = [
  /^Bună ziua/i,
  /^Subsemnatul/i,
  /^Vă aduc la cunoștință/i,
  /^Vă propun/i,
  /^Vă mulțumesc/i,
  /^Cu (respect|stimă)/i,
];

function normalizeFormatting(text: string): string {
  let t = text.replace(/\r\n/g, "\n");
  // Collapse 3+ newlines → exactly 2
  t = t.replace(/\n{3,}/g, "\n\n");
  const lines = t.split("\n").map((l) => l.trim());

  // Rebuild: insert blank line before paragraph-start keywords if missing
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      if (out.length > 0 && out[out.length - 1] !== "") out.push("");
      continue;
    }
    const isParaStart = PARAGRAPH_STARTS.some((rx) => rx.test(line));
    if (isParaStart && out.length > 0 && out[out.length - 1] !== "") {
      out.push("");
    }
    out.push(line);
  }

  // Signature: "Cu respect," \n {Name} — no blank line between them
  for (let i = out.length - 2; i > 0; i--) {
    const cur = out[i];
    if (cur && /^Cu (respect|stimă),?$/i.test(cur) && out[i + 1] === "" && out[i + 2]) {
      out.splice(i + 1, 1);
      break;
    }
  }

  return out.join("\n").trim();
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`ai-improve:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: `Prea multe cereri. Reîncearcă în ${Math.ceil(rl.resetIn / 1000)}s.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { descriere, tip, locatie, nume, adresa, imagini } = schema.parse(body);
    const template = getTemplate(tip ?? "altele");
    const photos = (imagini ?? []).slice(0, MAX_PHOTOS);
    const hasPhotos = photos.length > 0;

    const textContext = [
      `Descrierea brută a cetățeanului: ${descriere}`,
      locatie ? `Locație: ${locatie}` : "",
      nume ? `Nume cetățean: ${nume}` : "Nume: [NUMELE]",
      adresa ? `Adresa cetățean: ${adresa}` : "Adresa: [ADRESA]",
      tip ? `Tip problemă: ${tip}` : "",
      `Ghid pentru {DESCRIEREA_FORMALA_A_PROBLEMEI}: ${template.problema_ghid}`,
      `Ghid pentru {PROPUNEREA_CONCRETA}: ${template.propunere}`,
    ].filter(Boolean).join("\n");

    const visionInstruction = hasPhotos
      ? `\n\n⚠️ ATENȚIE — ${photos.length} FOTOGRAFII ATAȘATE mai jos. Le ANALIZEZI PRIMELE, apoi scrii sesizarea.

REGULI VISION (OBLIGATORII):
1. INTERZIS să scrii "pietonii sunt forțați să circule pe carosabil" decât dacă se VEDE clar că trotuarul e complet blocat și nu mai au pe unde merge.
2. Dacă se vede trotuar lat cu mașini doar pe o parte → scrie EXACT: "mașinile ocupă X% din lățimea trotuarului, rămâne spațiu de trecere de aproximativ Y metri."
3. Dacă se vede trotuar îngust/blocat → atunci poți menționa blocarea pietonilor.
4. Numără mașinile parcate în poze și menționează numărul concret.
5. Descrie doar fapte observabile: tip de stradă, lățime, număr mașini, starea pavajului, prezența/absența stâlpișorilor existenți, lăți­mea spațiului liber.
6. NU inventa copii, persoane cu dizabilități, biciclete, animale care nu se văd în poze.
7. Dacă descrierea cetățeanului spune "blocat complet" dar pozele arată că pietonii au loc, CORECTEAZĂ în sesizare pe baza pozelor.

Răspunde JSON:
{ "formal_text": "...", "descriere_rafinata": "propoziție scurtă (1-2 rânduri) care descrie fidelis ce vezi în poze, fără dramatizare" }`
      : "";

    const groq = getGroqClient();
    const userContent = hasPhotos
      ? [
          { type: "text" as const, text: textContext + visionInstruction },
          ...photos.map((url) => ({
            type: "image_url" as const,
            image_url: { url },
          })),
        ]
      : textContext;

    const completion = await groq.chat.completions.create({
      model: hasPhotos ? GROQ_MODEL_VISION : GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_FORMAL },
        // Groq SDK accepts string or array content depending on model.
        { role: "user", content: userContent as unknown as string },
      ],
      temperature: 0.3,
      max_tokens: 1100,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    let parsed: AIResponse;
    try {
      parsed = JSON.parse(content) as AIResponse;
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    if (!parsed.formal_text) {
      throw new Error("AI response missing formal_text");
    }

    parsed.formal_text = normalizeFormatting(parsed.formal_text);

    return NextResponse.json({ data: parsed });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Input invalid" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "AI unavailable";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
