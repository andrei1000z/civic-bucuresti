import { NextResponse } from "next/server";
import { z } from "zod";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq/client";
import { SYSTEM_PROMPT_FORMAL } from "@/lib/groq/prompts";
import { getTemplate } from "@/lib/groq/templates";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const schema = z.object({
  descriere: z.string().min(5).max(2000),
  tip: z.string().optional(),
  locatie: z.string().optional(),
  nume: z.string().optional(),
  adresa: z.string().optional(),
});

interface AIResponse {
  formal_text: string;
}

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
    const { descriere, tip, locatie, nume, adresa } = schema.parse(body);
    const template = getTemplate(tip ?? "altele");

    const userContext = [
      `Descrierea brută: ${descriere}`,
      locatie ? `Locație: ${locatie}` : "",
      nume ? `Nume cetățean: ${nume}` : "Nume: [NUMELE]",
      adresa ? `Adresa cetățean: ${adresa}` : "Adresa: [ADRESA]",
      tip ? `Tip problemă: ${tip}` : "",
      `Ghid pentru {DESCRIEREA_FORMALA_A_PROBLEMEI}: ${template.problema_ghid}`,
      `Ghid pentru {PROPUNEREA_CONCRETA}: ${template.propunere}`,
    ].filter(Boolean).join("\n");

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_FORMAL },
        { role: "user", content: userContext },
      ],
      temperature: 0.3,
      max_tokens: 900,
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
