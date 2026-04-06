import { z } from "zod";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq/client";
import { SYSTEM_PROMPT_CIVIC_ASSISTANT } from "@/lib/groq/prompts";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // aligned with vercel.json

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(20),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`ai-chat:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return Response.json({ error: "Prea multe mesaje. Așteaptă 1 minut." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { messages } = schema.parse(body);

    const groq = getGroqClient();
    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_CIVIC_ASSISTANT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return Response.json({ error: "Input invalid" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "AI unavailable";
    return Response.json({ error: msg }, { status: 500 });
  }
}
