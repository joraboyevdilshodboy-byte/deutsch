import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const learningAreaSchema = z.enum([
  "grammar",
  "listening",
  "reading",
  "writing",
  "vocabulary",
  "speaking",
]);

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("exercise"),
    area: learningAreaSchema.optional(),
    module: learningAreaSchema.optional(),
    topic: z.string().trim().min(1).max(120).optional(),
    score: z.number().int().min(0).max(10_000),
    total: z.number().int().min(1).max(10_000),
    answers: z.string().max(12_000).optional(),
    minutes: z.number().int().min(0).max(240).optional(),
  }),
  z.object({
    action: z.literal("activity"),
    kind: learningAreaSchema,
    minutes: z.number().int().min(0).max(240).default(5),
  }),
  z.object({
    action: z.literal("vocabulary"),
    word: z.string().trim().min(1).max(120),
    translation: z.string().trim().max(240).optional(),
    known: z.boolean(),
  }),
  z.object({
    action: z.literal("writing"),
    content: z.string().trim().min(10).max(12_000),
    task: z.string().trim().max(300).optional(),
    feedback: z.string().max(20_000).optional(),
    score: z.number().int().min(0).max(100).optional(),
    minutes: z.number().int().min(0).max(240).optional(),
  }),
]);

type TransactionClient = Prisma.TransactionClient;

function utcStartOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Add an activity and only advance the streak once per UTC calendar day. */
async function addActivity(
  tx: TransactionClient,
  userId: string,
  kind: string,
  minutes: number,
  xp = 0,
) {
  const now = new Date();
  const today = utcStartOfDay(now);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const [user, mostRecentActivity] = await Promise.all([
    tx.user.findUnique({
      where: { id: userId },
      select: { streak: true, longestStreak: true },
    }),
    tx.activity.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  if (!user) {
    throw new Error("Foydalanuvchi topilmadi.");
  }

  await tx.activity.create({ data: { userId, kind, minutes } });

  const hasActivityToday = Boolean(
    mostRecentActivity && mostRecentActivity.createdAt >= today,
  );
  const continuedYesterday = Boolean(
    mostRecentActivity &&
      mostRecentActivity.createdAt >= yesterday &&
      mostRecentActivity.createdAt < today,
  );
  const nextStreak = hasActivityToday
    ? user.streak
    : continuedYesterday
      ? user.streak + 1
      : 1;

  return tx.user.update({
    where: { id: userId },
    data: {
      streak: nextStreak,
      longestStreak: Math.max(user.longestStreak, nextStreak),
      ...(xp > 0 ? { totalXp: { increment: xp } } : {}),
    },
    select: { streak: true, longestStreak: true, totalXp: true },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Progress ma'lumotlarini tekshiring." },
      { status: 400 },
    );
  }

  try {
    const data = parsed.data;

    if (data.action === "exercise") {
      const area = data.area ?? data.module;
      if (!area) {
        return NextResponse.json({ error: "Mashq bo'limini tanlang." }, { status: 400 });
      }
      if (data.score > data.total) {
        return NextResponse.json({ error: "Natija savollar sonidan katta bo'la olmaydi." }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const attempt = await tx.exerciseAttempt.create({
          data: {
            userId,
            area,
            topic: data.topic,
            score: data.score,
            total: data.total,
            answers: data.answers,
          },
          select: { id: true, score: true, total: true, completedAt: true },
        });
        const xp = Math.max(5, Math.round((data.score / data.total) * 15));
        const stats = await addActivity(tx, userId, area, data.minutes ?? 5, xp);
        return { attempt, stats };
      });

      return NextResponse.json({ ok: true, ...result });
    }

    if (data.action === "activity") {
      const stats = await prisma.$transaction(async (tx: Prisma.TransactionClient) =>
        addActivity(tx, userId, data.kind, data.minutes),
      );
      return NextResponse.json({ ok: true, stats });
    }

    if (data.action === "vocabulary") {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await tx.vocabularyReview.findUnique({
          where: { userId_word: { userId, word: data.word } },
          select: { intervalDays: true },
        });
        const intervalDays = data.known
          ? Math.min(Math.max(existing?.intervalDays ?? 1, 1) * 2, 60)
          : 1;
        const nextReview = new Date();
        nextReview.setUTCDate(nextReview.getUTCDate() + intervalDays);

        const review = await tx.vocabularyReview.upsert({
          where: { userId_word: { userId, word: data.word } },
          create: {
            userId,
            word: data.word,
            translation: data.translation,
            known: data.known,
            intervalDays,
            lastReviewed: new Date(),
            nextReview,
          },
          update: {
            translation: data.translation,
            known: data.known,
            intervalDays,
            lastReviewed: new Date(),
            nextReview,
          },
          select: { word: true, known: true, intervalDays: true, nextReview: true },
        });
        const stats = await addActivity(tx, userId, "vocabulary", 1, data.known ? 2 : 1);
        return { review, stats };
      });

      return NextResponse.json({ ok: true, ...result });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const writing = await tx.writingSubmission.create({
        data: {
          userId,
          content: data.content,
          task: data.task,
          feedback: data.feedback,
          score: data.score,
        },
        select: { id: true, createdAt: true, score: true },
      });
      const stats = await addActivity(tx, userId, "writing", data.minutes ?? 8, 10);
      return { writing, stats };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Progress persistence failed", error);
    return NextResponse.json(
      { error: "Progress saqlanmadi. Keyinroq qayta urinib ko'ring." },
      { status: 500 },
    );
  }
}
