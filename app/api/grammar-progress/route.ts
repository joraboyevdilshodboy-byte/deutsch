import { auth } from "@/auth";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  const attempts = await prisma.exerciseAttempt.findMany({
    where: { userId: session.user.id, area: "grammar" },
    select: { topic: true, score: true, total: true },
  });

  // Group by topic and calculate progress per topic.
  const topicProgress: Record<string, number> = {};
  for (const attempt of attempts) {
    if (!attempt.topic) continue;
    const current = topicProgress[attempt.topic] ?? 0;
    const percent = attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0;
    topicProgress[attempt.topic] = Math.max(current, percent);
  }

  return NextResponse.json({ progress: topicProgress });
}