import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { callAI, AIProviderError } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const grammarCheckSchema = z.object({
  text: z.string().trim().min(10, "Matn kamida 10 belgidan iborat bo'lishi kerak.").max(12_000),
  task: z.string().trim().max(300).optional(),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
});

function errorResponse(error: unknown) {
  if (error instanceof AIProviderError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error && error.name === "AbortError") {
    return NextResponse.json({ error: "So'rov bekor qilindi." }, { status: 499 });
  }

  console.error("Grammar check request failed", error);
  return NextResponse.json(
    { error: "Matnni tekshirishda xatolik yuz berdi. Qayta urinib ko'ring." },
    { status: 500 },
  );
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
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = grammarCheckSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Matnni tekshiring." },
      { status: 400 },
    );
  }

  const { text, task } = parsed.data;
  const level = parsed.data.level ?? session.user.level ?? "A2";

  try {
    const result = await callAI("writing-check", {
      contents: [
        {
          role: "user",
          content: `${task ? `Vazifa: ${task}\n\n` : ""}Nemischa matnim:\n${text}`,
        },
      ],
      systemInstruction: [
        "Du bist ein sorgfaeltiger Deutschlehrer.",
        `Bewerte den folgenden Text fuer das Niveau ${level} und bestimme auf welchem CEFR-Level der Text geschrieben wurde (z. B. A1, A2, B1, ...).`,
        "Antworte asosan o'zbek tilida, ammo nemischa tuzatish misollarini nemis tilida qoldir.",
        "Antworte NUR im folgenden JSON-Format, ohne zusaetzlichen Text, ohne Markdown-Codebloecke:",
        JSON.stringify({
          corrected_text: "Tuzatilgan to'liq matn (nemischa)",
          mistakes: [
            {
              original: "Xato qism (nemischa)",
              correction: "Tuzatilgan qism (nemischa)",
              type: "grammar|spelling|vocabulary|style",
              severity: "low|medium|high",
              explanation: "Qisqa tushuntirish (o'zbekcha)",
            },
          ],
          strengths: ["Qisqacha ijobiy jihatlarning ro'yxati (o'zbekcha)"],
          weaknesses: ["Qisqacha kamchiliklar va ularni qanday yaxshilash bo'yicha takliflar (o'zbekcha)"],
          suggestions: ["An actionable suggestion or exercise (o'zbekcha)"],
          overall_feedback: "Umumiy fikr-mulohaza (o'zbekcha)",
          estimated_level: "B1",
          confidence: "low|medium|high"
        }),
      ].join(" "),
      maxOutputTokens: 1_600,
      temperature: 0.15,
      signal: request.signal,
    });

    // Save the writing submission to the database.
    await prisma.writingSubmission.create({
      data: {
        userId: session.user.id,
        task,
        content: text,
        feedback: result.text,
      },
    });

    // Try to parse the JSON feedback. If parsing succeeds, return parsed JSON for easier frontend consumption.
    try {
      const parsed = JSON.parse(result.text);
      return NextResponse.json({ feedback: parsed, provider: result.provider });
    } catch (err) {
      // If parsing fails, return raw text so frontend can display it and developer can debug.
      console.warn("Writing check: failed to parse JSON, returning raw text.", err);
      return NextResponse.json({ feedback: result.text, provider: result.provider });
    }
  } catch (error) {
    return errorResponse(error);
  }
}
