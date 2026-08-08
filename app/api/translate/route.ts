import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { callAI, AIProviderError } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const translateRequestSchema = z.object({
  text: z.string().trim().min(1).max(4_000),
  target: z.enum(["uz", "de"]).default("uz"),
});

function errorResponse(error: unknown) {
  if (error instanceof AIProviderError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Tarjima olinmadi. Qayta urinib ko‘ring." }, { status: 500 });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo‘lishi kerak." }, { status: 400 });
  }

  const parsed = translateRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Matn bo‘sh yoki juda uzun." }, { status: 400 });
  }

  const { text, target } = parsed.data;
  const targetLanguage = target === "uz" ? "Uzbek" : "German";

  try {
    const result = await callAI("chat", {
      contents: [{ role: "user", content: text }],
      systemInstruction: `You are a professional translator. Translate the provided text into ${targetLanguage} accurately, naturally, and with the correct tone. Preserve the original meaning and keep the wording natural for everyday use. Return only the translated text without any extra commentary.`,
      maxOutputTokens: 600,
      temperature: 0.2,
    });

    return NextResponse.json({ translation: result.text?.trim() ?? "" });
  } catch (error) {
    return errorResponse(error);
  }
}
