import { NextResponse } from "next/server";
import { z } from "zod";
import { getGroqClient, GROQ_MODEL_FAST } from "@/lib/groq/client";
import { SYSTEM_PROMPT_CLASSIFIER } from "@/lib/groq/prompts";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const schema = z.object({
  text: z.string().min(3).max(1000),
});

interface ClassifyResponse {
  tip: string;
  sector: string;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`ai-classify:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { text } = schema.parse(body);

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL_FAST,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_CLASSIFIER },
        { role: "user", content: text },
      ],
      temperature: 0.1,
      max_tokens: 100,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content) as ClassifyResponse;
    const validTipuri = ["groapa", "trotuar", "iluminat", "copac", "gunoi", "parcare", "graffiti", "altele"];
    const validSectoare = ["S1", "S2", "S3", "S4", "S5", "S6"];

    const tip = validTipuri.includes(parsed.tip) ? parsed.tip : "altele";
    const sector = validSectoare.includes(parsed.sector) ? parsed.sector : "S1";

    return NextResponse.json({ data: { tip, sector } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Input invalid" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "AI unavailable";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
