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

  const reviews = await prisma.vocabularyReview.findMany({
    where: { userId: session.user.id },
    select: { word: true, known: true, nextReview: true },
    orderBy: { lastReviewed: "desc" },
  });

  const seenWords = reviews.map((r) => r.word);

  return NextResponse.json({
    seenWords,
    reviews: reviews.map((r) => ({
      word: r.word,
      known: r.known,
      nextReview: r.nextReview.toISOString(),
    })),
  });
}