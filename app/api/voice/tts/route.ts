import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Voice IDs — multilingual voices that handle both Uzbek and German naturally.
// "Rachel" (21m00Tcm4TlvDq8ikWAM) is a high-quality multilingual voice.
// "Daniel" (onwK4e9ZLuTAKqWW03F9) is a natural German voice.
const VOICES = {
  uz: "21m00Tcm4TlvDq8ikWAM", // Rachel — multilingual, natural Uzbek pronunciation
  de: "onwK4e9ZLuTAKqWW03F9", // Daniel — native German voice
} as const;

const ttsSchema = z.object({
  text: z.string().trim().min(1).max(4_000),
  lang: z.enum(["uz", "de"]).default("de"),
  rate: z.number().min(0.5).max(2).optional(),
});

/**
 * ElevenLabs TTS endpoint.
 *
 * Reads ELEVENLABS_API_KEY from the server environment only — never
 * exposed to the client. Returns the audio stream (MP3) directly so the
 * frontend can play it and sync the orb animation.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY sozlanmagan." }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = ttsSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Matn bo'sh yoki juda uzun." }, { status: 400 });
  }

  const { text, lang } = parsed.data;
  const voiceId = VOICES[lang] ?? VOICES.de;

  try {
    const response = await fetch(`${ELEVENLABS_TTS_URL}/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      let detail = "";
      try {
        const payload = (await response.json()) as { detail?: string };
        detail = payload.detail ?? "";
      } catch {
        // ignore
      }
      console.error("ElevenLabs TTS error", response.status, detail);
      return NextResponse.json(
        { error: `Ovoz yaratib bo'lmadi (${response.status}).` },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    if (!response.body) {
      return NextResponse.json({ error: "Ovoz yaratib bo'lmadi." }, { status: 502 });
    }

    // Stream the audio back to the client
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Audio-Lang": lang,
      },
    });
  } catch (error) {
    console.error("ElevenLabs TTS request failed:", error);
    return NextResponse.json(
      { error: "Ovoz yaratishda xatolik yuz berdi." },
      { status: 500 },
    );
  }
}