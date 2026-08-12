import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { callAI, AIProviderError } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const voiceChatSchema = z.object({
  message: z.string().trim().min(1).max(4_000),
  level: z.enum(["A1", "A2", "B1", "B2"]).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4_000),
      }),
    )
    .max(20)
    .optional(),
});

/**
 * Detect whether the user's message is primarily Uzbek or German.
 * Returns "uz" for Uzbek, "de" for German.
 */
function detectLanguage(text: string): "uz" | "de" {
  const trimmed = text.trim().toLowerCase();

  // German-specific characters and common words
  const germanMarkers = [
    "ä", "ö", "ü", "ß",
    "ich", "du", "sie", "wir", "ihr", "und", "der", "die", "das",
    "ist", "nicht", "ein", "eine", "mit", "auf", "für", "von",
    "wie", "was", "wo", "warum", "wann", "wer", "wieviel",
    "hallo", "guten", "danke", "bitte", "ja", "nein", "gut",
    "sprechen", "lernen", "deutsch", "sprache", "schule",
  ];

  // Uzbek-specific characters and common words
  const uzbekMarkers = [
    "o‘", "o'", "g‘", "g'", "sh", "ch", "ng",
    "salom", "rahmat", "yaxshi", "qanday", "nima", "qayerda",
    "men", "sen", "biz", "siz", "ular", "bu", "shu", "u",
    "ha", "yo'q", "yo‘q", "kel", "bor", "o'zbek", "o‘zbek",
    "til", "gapir", "o'rgan", "o‘rgan", "dars", "maktab",
  ];

  let germanScore = 0;
  let uzbekScore = 0;

  for (const marker of germanMarkers) {
    if (trimmed.includes(marker)) germanScore++;
  }

  for (const marker of uzbekMarkers) {
    if (trimmed.includes(marker)) uzbekScore++;
  }

  // German umlauts are a strong signal
  if (/[äöüß]/.test(trimmed)) germanScore += 3;

  // Uzbek apostrophe forms are a strong signal
  if (/[o‘o'g‘g']/.test(trimmed)) uzbekScore += 2;

  if (uzbekScore > germanScore) return "uz";
  if (germanScore > uzbekScore) return "de";

  // Default to German for the language-learning context
  return "de";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  const key = `${session.user.id}:voice-chat`;
  const rateLimit = enforceRateLimit(key, { maxRequests: 12, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterMs);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = voiceChatSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Xabar bo'sh yoki juda uzun." }, { status: 400 });
  }

  const { message, history } = parsed.data;
  const level = parsed.data.level ?? session.user.level ?? "A2";

  // Detect the language of the user's message
  const detectedLang = detectLanguage(message);

  // Load user record for persona preference
  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredPersona: true, level: true },
  });

  const systemInstruction =
    detectedLang === "uz"
      ? [
          "Sen Deutsch-GG ning ovozli AI o'qituvchisisan.",
          "Sening javoblaring ElevenLabs TTS orqali ovozga aylantiriladi.",
          "Shuning uchun har bir javobni o'zbek talaffuzi uchun optimallashtirilgan shaklda yoz.",
          "Faqat sof o'zbek tilida gaplash.",
          "Har doim o'zbek lotin alifbosining to'g'ri belgilaridan foydalan.",
          "o' va g' harflarini har doim to'g'ri yoz.",
          "Juda uzun jumlalar tuzma.",
          "Bir jumlada 8-14 ta so'z ishlat.",
          "Kerak bo'lsa jumlalarni ikkiga bo'l.",
          "Qisqartmalarni ishlatma.",
          "Raqamlarni so'z bilan yoz.",
          "Inglizcha va nemischa kirish so'zlarini ishlatma.",
          "Tabiiy suhbat uslubida gapir.",
          "yo'q so'zini har doim yo'q shaklida yoz.",
          "bo'ladi so'zini aniq yoz.",
          "o'rganamiz, to'g'ri, g'oya, g'alaba, qanday, rahmat, xursandman kabi so'zlarni hech qachon o'zgartirma.",
          "Murakkab so'zlarni sodda sinonimlar bilan almashtir.",
          `Foydalanuvchi taxminan ${level} darajasida; shunga mos sodda va tushunarli tilda gapir.`,
          "Xato qilsa, yumshoq tarzda tuzatib ko'rsat.",
          "Suhbatni davom ettirish uchun ko'pi bilan bitta savol ber.",
          "Ovozli o'qish (TTS) uchun qisqa va aniq javob ber. Markdown, emoji va maxsus belgilardan foydalanma.",
        ].join(" ")
      : [
          "Du bist der Sprachassistent von Deutsch-GG.",
          "Der Benutzer hat auf Deutsch gesprochen, also antworte auf Deutsch.",
          "Sprich natürlich, fließend und kurz.",
          `Der Benutzer ist ungefähr auf dem Niveau ${level}; sprich einfach und verständlich.`,
          "Wenn der Benutzer einen Fehler macht, korrigiere ihn sanft.",
          "Stelle höchstens eine Frage, um das Gespräch fortzusetzen.",
          "Für die Sprachausgabe (TTS) gib eine kurze und klare Antwort. Verwende kein Markdown, keine Emojis und keine Sonderzeichen.",
        ].join(" ");

  const contents = [
    ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const result = await callAI("chat", {
      contents,
      systemInstruction,
      maxOutputTokens: 500,
      temperature: 0.7,
      signal: request.signal,
    });

    // Save conversation to database for history
    try {
      await prisma.conversationMessage.create({
        data: { userId: session.user.id, role: "user", content: message },
      });
      await prisma.conversationMessage.create({
        data: { userId: session.user.id, role: "assistant", content: result.text },
      });
    } catch (dbErr) {
      console.warn("Could not save voice conversation:", dbErr);
    }

    // Log activity
    try {
      await prisma.activity.create({
        data: { userId: session.user.id, kind: "speaking", minutes: 2 },
      });
    } catch (dbErr) {
      console.warn("Could not save voice activity:", dbErr);
    }

    return NextResponse.json({
      text: result.text,
      provider: result.provider,
      lang: detectedLang,
    });
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "So'rov bekor qilindi." }, { status: 499 });
    }
    console.error("Voice chat failed:", error);
    return NextResponse.json(
      { error: "AI javob olishda xatolik yuz berdi. Qayta urinib ko'ring." },
      { status: 500 },
    );
  }
}