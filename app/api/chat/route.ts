import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { streamAI, callAI, AIProviderError } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(24).optional(),
  message: z.string().trim().min(1).max(4_000).optional(),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  persona: z.string().optional(),
});

function errorResponse(error: unknown) {
  if (error instanceof AIProviderError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error && error.name === "AbortError") {
    return NextResponse.json({ error: "So'rov bekor qilindi." }, { status: 499 });
  }

  console.error("Chat request failed", error);
  return NextResponse.json(
    { error: "Suhbatni boshlashda xatolik yuz berdi. Qayta urinib ko'ring." },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  const messages = await prisma.conversationMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  const key = `${session.user.id}:chat`;
  const rateLimit = enforceRateLimit(key, { maxRequests: 25, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterMs);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Xabar bo'sh yoki juda uzun." },
      { status: 400 },
    );
  }

  const messages =
    parsed.data.messages ??
    (parsed.data.message ? [{ role: "user" as const, content: parsed.data.message }] : []);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Kamida bitta xabar yuboring." }, { status: 400 });
  }

  const level = parsed.data.level ?? session.user.level ?? "A2";

  // Save the user's message to the database.
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    await prisma.conversationMessage.create({
      data: {
        userId: session.user.id,
        role: "user",
        content: lastUserMessage.content,
      },
    });
  }

  // Load user record to read or set preferredPersona.
  const userRecord = await prisma.user.findUnique({ where: { id: session.user.id }, select: { preferredPersona: true, level: true } });

  // Load full conversation history from the database (last 15 messages).
  const history = await prisma.conversationMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 15,
    select: { role: true, content: true },
  });

  const aiMessages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    // Determine persona-specific system instruction additions.
    const persona = (parsed.data as any).persona as string | undefined;

    // If a persona was provided in the request, persist it to the user record.
    if (persona) {
      try {
        await prisma.user.update({ where: { id: session.user.id }, data: { preferredPersona: persona } });
      } catch (e) {
        // ignore update failures — not critical
        console.warn("Failed to persist preferredPersona", e);
      }
    }

    const effectivePersona = persona ?? userRecord?.preferredPersona ?? undefined;

    const baseInstructions = [
      "Du bist ein freundlicher Deutschlehrer fuer eine Sprachlernplattform.",
      `Der Lernende arbeitet ungefaehr auf dem Niveau ${level}; verwende einfaches, natuerliches Deutsch auf A2-B1-Niveau.`,
      "Fuehre ein natuerliches, fortlaufendes Gespraech. Antworte mit mindestens 2-3 vollstaendigen Saetzen.",
      "Stelle hoechstens eine passende Rueckfrage, um das Gespraech am Laufen zu halten.",
      "Wenn der Lernende einen Fehler macht, korrigiere ihn sanft am Ende mit 'Korrektur: ...'.",
      "Erklaere die Korrektur kurz und ermutigend. Antworte nicht auf Englisch.",
      "Beziehe dich auf fruehere Nachrichten im Gespraech, um den Dialog natuerlich fortzusetzen.",
      "If the user writes in Uzbek (o'zbekcha), reply in Uzbek. Otherwise reply in German.",
      "Agar foydalanuvchi o'zbek tilida yozsa, o'zbek tilida javob bering; aks holda nemis tilida davom eting.",
    ];

    let personaInstructions: string[] = [];
    if (effectivePersona === "preppy") {
      personaInstructions = [
        "You are 'Preppy' — a focused IELTS-style preparation coach. Ask targeted, exam-style questions, give model answers, and provide concise scoring and improvement tips.",
        "Keep feedback actionable and exam-oriented: give a band-style estimate, one strength, and one specific improvement the learner can practice now.",
        // Strong guidance: append a single JSON object exactly at the end of your reply. This JSON must be the only JSON object in the reply and must be surrounded by triple backticks ``` so it can be parsed by the client. Example:",
        "At the END of your reply, append only one JSON object inside triple backticks, e.g. ```{\"band\":\"6.5\", \"model_answer\":\"...\", \"suggestions\": [\"...\"]}```. Do not include any other JSON elsewhere. The user should still see a natural human-readable answer before the JSON block.",
      ];
    }

    const systemInstruction = [...baseInstructions, ...personaInstructions].join(" ");

    if (effectivePersona === "preppy") {
      // For Preppy persona, use a single non-streaming call with strict temperature to
      // ensure structured, exam-style output (and JSON). This makes Preppy more reliable
      // for exam-style responses and JSON schema output.
      const preppySystem = systemInstruction + " Provide a natural human-readable answer first, then at the very end include a single JSON object inside triple backticks with keys: band, model_answer, suggestions. The JSON must be the only JSON in the reply. Use the requested language (German or Uzbek) for the human-readable part. Respond concisely.";
      const result = await callAI("chat", {
        contents: aiMessages.concat([{ role: "user", content: (parsed.data as any).message ?? (messages[messages.length-1]?.content ?? "") }]),
        systemInstruction: preppySystem,
        maxOutputTokens: 1200,
        temperature: 0.0,
      });

      const text = result.text ?? "";
      // Save assistant message
      const created = await prisma.conversationMessage.create({ data: { userId: session.user.id, role: "assistant", content: text } });

      // Return as plain text response
      return new Response(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const { stream } = await streamAI("chat", {
      contents: aiMessages,
      systemInstruction,
      maxOutputTokens: 500,
      temperature: 0.7,
      signal: request.signal,
    });

    // Wrap the stream so we can save the assistant's response to the database.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = stream.getReader();
    let fullText = "";

    const wrappedStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
          // Save the assistant's full response.
          if (fullText.trim()) {
            await prisma.conversationMessage.create({
              data: {
                userId: session.user.id,
                role: "assistant",
                content: fullText.trim(),
              },
            });
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
      async cancel() {
        await reader.cancel();
      },
    });

    return new Response(wrappedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat handler error, falling back to local assistant", error);
    try {
      // Local fallback: produce a short, helpful reply without calling AI providers.
      const userText = messages[messages.length - 1]?.content ?? (parsed.data as any).message ?? "";
      const uzWords = /\b(assalomu|salom|rahmat|men|siz|qanday|yaxshi|bor|yoq|yo'q|o'zim|oʻzim)\b/i;
      const cyrillic = /[\u0400-\u04FF]/;
      const isUz = uzWords.test(userText) || cyrillic.test(userText);
      const reply = isUz
        ? `Salom! Savolingiz uchun rahmat. Bu yerda AI xizmatlari hozircha ishlamayapti, lekin men yordam berishga harakat qilaman. Iltimos, qisqaroq savol bering yoki gapni takrorlang.`
        : `Hallo! Danke für deine Nachricht. Die AI-Dienste sind gerade nicht erreichbar, aber ich helfe dir gerne weiter. Bitte stelle eine kürzere Frage oder wiederhole den Satz.`;

      // Save fallback assistant message for history so UI remains consistent.
      await prisma.conversationMessage.create({ data: { userId: session.user.id, role: "assistant", content: reply } });

      return new Response(reply, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    } catch (innerErr) {
      console.error("Fallback reply failed", innerErr);
      return errorResponse(error);
    }
  }
}