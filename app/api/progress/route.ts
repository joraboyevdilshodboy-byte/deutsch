import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getMinutesForWindow } from "@/lib/progress-metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const learningAreaSchema = z.enum([
  "grammar",
  "listening",
  "reading",
  "writing",
  "vocabulary",
  "speaking",
  "mock-test",
  "voice",
  "site",
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
  z.object({
    action: z.literal("session"),
    activityType: learningAreaSchema,
    durationMinutes: z.number().int().min(0).max(240).default(5),
    correctAnswers: z.number().int().min(0).max(10_000).default(0),
    totalQuestions: z.number().int().min(0).max(10_000).default(0),
  }),
]);

type TransactionClient = Prisma.TransactionClient;

type StudySessionSummary = {
  activityType: string;
  durationMinutes: number;
  correctAnswers: number;
  totalQuestions: number;
  createdAt: Date;
};

function localStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseWeekStart(value: string | null): Date {
  if (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getStreakFromSessions(sessions: Array<{ createdAt: Date | string }>) {
  const activityDays = new Set(
    sessions.map((session) => formatDateKey(new Date(session.createdAt))),
  );

  const today = localStartOfDay(new Date());
  let streak = 0;
  const cursor = new Date(today);

  while (activityDays.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Add an activity and only advance the streak once per local calendar day. */
async function addActivity(
  tx: TransactionClient,
  userId: string,
  kind: string,
  minutes: number,
  xp = 0,
) {
  const now = new Date();
  const today = localStartOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

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

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  const url = new URL(request.url);
  const weekStart = parseWeekStart(url.searchParams.get("weekStart"));

  const weekEnd = addDays(weekStart, 7);

  const today = localStartOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const [weekSessions, allSessions] = await Promise.all([
    prisma.studySession.findMany({
      where: {
        userId,
        createdAt: { gte: weekStart, lt: weekEnd },
      },
      select: {
        activityType: true,
        durationMinutes: true,
        correctAnswers: true,
        totalQuestions: true,
        createdAt: true,
      },
    }),
    prisma.studySession.findMany({
      where: { userId },
      select: { activityType: true, durationMinutes: true, createdAt: true },
    }),
  ]);

  // Build daily buckets for the 7 days of the selected week.
  const dayNames = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"];
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return {
      date: formatDateKey(date),
      label: dayNames[index],
      minutes: 0,
      correct: 0,
      attempted: 0,
    };
  });

  const dayIndexMap = new Map(daily.map((item, index) => [item.date, index]));

  let totalMinutes = 0;
  let totalCorrect = 0;
  let totalAttempted = 0;

  for (const s of weekSessions) {
    const key = formatDateKey(s.createdAt);
    const index = dayIndexMap.get(key);
    if (index === undefined) continue;
    daily[index].minutes += s.durationMinutes;
    daily[index].correct += s.correctAnswers;
    daily[index].attempted += s.totalQuestions;
    totalMinutes += s.durationMinutes;
    totalCorrect += s.correctAnswers;
    totalAttempted += s.totalQuestions;
  }

  const maxMinutes = Math.max(...daily.map((d) => d.minutes), 1);
  const chartData = daily.map((d) => ({
    ...d,
    height: Math.round((d.minutes / maxMinutes) * 100),
  }));

  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const streak = getStreakFromSessions(allSessions as Array<{ createdAt: Date | string }>);
  const todayMinutes = getMinutesForWindow(allSessions as StudySessionSummary[], today, tomorrow);
  const totalSiteMinutes = (allSessions as StudySessionSummary[]).reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  return NextResponse.json({
    weekStart: formatDateKey(weekStart),
    weekEnd: formatDateKey(addDays(weekStart, 6)),
    isCurrentWeek: formatDateKey(weekStart) === formatDateKey(localStartOfDay(new Date())),
    streak,
    totalMinutes,
    todayMinutes,
    siteMinutes: totalSiteMinutes,
    accuracy,
    chartData,
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

    if (data.action === "session") {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const studySession = await tx.studySession.create({
          data: {
            userId,
            activityType: data.activityType,
            durationMinutes: data.durationMinutes,
            correctAnswers: data.correctAnswers,
            totalQuestions: data.totalQuestions,
          },
          select: { id: true, activityType: true, durationMinutes: true, createdAt: true },
        });
        const stats = await addActivity(tx, userId, data.activityType, data.durationMinutes);
        return { studySession, stats };
      });

      return NextResponse.json({ ok: true, ...result });
    }

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
        await tx.studySession.create({
          data: {
            userId,
            activityType: area,
            durationMinutes: data.minutes ?? 5,
            correctAnswers: data.score,
            totalQuestions: data.total,
          },
        });
        return { attempt, stats };
      });

      return NextResponse.json({ ok: true, ...result });
    }

    if (data.action === "activity") {
      const stats = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.studySession.create({
          data: {
            userId,
            activityType: data.kind,
            durationMinutes: data.minutes,
          },
        });
        return addActivity(tx, userId, data.kind, data.minutes);
      });
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
        nextReview.setDate(nextReview.getDate() + intervalDays);

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
        await tx.studySession.create({
          data: {
            userId,
            activityType: "vocabulary",
            durationMinutes: 1,
            correctAnswers: data.known ? 1 : 0,
            totalQuestions: 1,
          },
        });
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
      await tx.studySession.create({
        data: {
          userId,
          activityType: "writing",
          durationMinutes: data.minutes ?? 8,
          correctAnswers: data.score ?? 0,
          totalQuestions: 100,
        },
      });
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