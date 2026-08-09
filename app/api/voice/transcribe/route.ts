import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_STT_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY sozlanmagan." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Audio fayl yuborilmadi." }, { status: 400 });
  }

  const audioFile = formData.get("audio");
  if (!audioFile || !(audioFile instanceof File)) {
    return NextResponse.json({ error: "Audio fayl topilmadi." }, { status: 400 });
  }

  // Validate audio size (max 10MB)
  if (audioFile.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio fayl juda katta (maks 10MB)." }, { status: 400 });
  }

  const model = process.env.GROQ_STT_MODEL?.trim() || "whisper-large-v3-turbo";

  const groqForm = new FormData();
  groqForm.append("file", audioFile, audioFile.name || "recording.webm");
  groqForm.append("model", model);
  groqForm.append("language", "de");
  groqForm.append("response_format", "json");

  try {
    const response = await fetch(GROQ_STT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqForm,
    });

    if (!response.ok) {
      let detail = "";
      try {
        const payload = (await response.json()) as { error?: { message?: string } };
        detail = payload.error?.message ?? "";
      } catch {
        // ignore
      }
      console.error("Groq STT error", response.status, detail);
      return NextResponse.json(
        { error: `Ovozni matnga aylantirib bo'lmadi (${response.status}).` },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const payload = (await response.json()) as { text?: string };
    const text = payload.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Ovoz aniqlanmadi. Qayta urinib ko'ring." }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Groq STT request failed:", error);
    return NextResponse.json(
      { error: "Ovozni matnga aylantirishda xatolik yuz berdi." },
      { status: 500 },
    );
  }
}