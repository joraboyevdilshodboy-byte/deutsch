import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { callAI, AIProviderError } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pronunciationSchema = z.object({
  targetText: z.string().trim().min(1).max(500),
  spokenText: z.string().trim().min(1).max(500),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
});

function calculateSimilarityScore(target: string, spoken: string): number {
  const cleanTarget = target.toLowerCase().replace(/[^\w\säöüß]/gi, "").trim();
  const cleanSpoken = spoken.toLowerCase().replace(/[^\w\säöüß]/gi, "").trim();

  if (cleanTarget === cleanSpoken) return 100;
  if (!cleanTarget || !cleanSpoken) return 0;

  const targetWords = cleanTarget.split(/\s+/);
  const spokenWords = cleanSpoken.split(/\s+/);

  let matchCount = 0;
  targetWords.forEach((word) => {
    if (spokenWords.includes(word)) {
      matchCount++;
    }
  });

  const wordScore = Math.round((matchCount / targetWords.length) * 100);
  return Math.min(100, Math.max(10, wordScore));
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

  const parsed = pronunciationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." },
      { status: 400 },
    );
  }

  const { targetText, spokenText } = parsed.data;
  const level = parsed.data.level ?? session.user.level ?? "A2";
  const baseScore = calculateSimilarityScore(targetText, spokenText);

  try {
    const aiResult = await callAI("speaking-pronunciation", {
      contents: [
        {
          role: "user",
          content: `Maqsadli nemischa gap: "${targetText}"\nFoydalanuvchi aytgan/tanigan matn: "${spokenText}"`,
        },
      ],
      systemInstruction: [
        "Du bist ein erfahrener Deutschlehrer und Phonetik-Experte.",
        `Analysiere die Aussprache des Nutzers fuer das CEFR-Niveau ${level}.`,
        "Antworte asosan o'zbek tilida, nemischa misol va so'zlarni nemischa saqla.",
        "Antworte NORMALIAS NORMALLY ONLY im folgenden JSON-Format, ohne zusaetzlichen Text, ohne Markdown-Codebloecke:",
        JSON.stringify({
          score: baseScore,
          words: [
            {
              word: "Ich",
              status: "correct|warning|incorrect",
              feedback: "Talaffuz bo'yicha izoh (o'zbekcha)",
            },
          ],
          phoneticTips: [
            "Nemis tili talaffuzini yaxshilash uchun 2-3 ta maslahat (o'zbekcha)",
          ],
          overallFeedback: "Umumiy baha va tavsiya (o'zbekcha)",
        }),
      ].join(" "),
      maxOutputTokens: 1200,
      temperature: 0.2,
      signal: request.signal,
    });

    let feedbackData: {
      score?: number;
      words?: Array<{ word: string; status: "correct" | "warning" | "incorrect"; feedback?: string }>;
      phoneticTips?: string[];
      overallFeedback?: string;
    } = {};

    try {
      feedbackData = JSON.parse(aiResult.text);
    } catch {
      // Fallback if AI didn't return strict JSON
      const targetWords = targetText.split(/\s+/);
      const spokenClean = spokenText.toLowerCase();
      feedbackData = {
        score: baseScore,
        words: targetWords.map((w) => {
          const isIncluded = spokenClean.includes(w.toLowerCase());
          return {
            word: w,
            status: isIncluded ? "correct" : "warning",
            feedback: isIncluded ? "Tog'ri aytildi" : "Tushunarsiz yoki tushib qoldi",
          };
        }),
        phoneticTips: [
          "Unlilar (ä, ö, ü) va diphtonglar (ei, eu, au) talaffuziga alohida e'tibor bering.",
          "Har bir so'zning urg'usiga e'tibor qiling.",
        ],
        overallFeedback: `Talaffuzingiz ko'rsatkichi: ${baseScore}%. Yaxshi natija!`,
      };
    }

    const finalScore = typeof feedbackData.score === "number" ? Math.min(100, Math.max(0, feedbackData.score)) : baseScore;

    // Log user activity and reward XP (+25 XP)
    try {
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          kind: "speaking",
          minutes: 2,
        },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXp: { increment: 25 },
        },
      });
    } catch (dbErr) {
      console.warn("Could not save XP activity for pronunciation check:", dbErr);
    }

    return NextResponse.json({
      score: finalScore,
      words: feedbackData.words ?? [],
      phoneticTips: feedbackData.phoneticTips ?? [],
      overallFeedback: feedbackData.overallFeedback ?? "Talaffuzingiz qabul qilindi.",
      xpEarned: 25,
    });
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Pronunciation API failed:", error);
    return NextResponse.json({ error: "Talaffuzni tahlil qilishda xatolik yuz berdi." }, { status: 500 });
  }
}
