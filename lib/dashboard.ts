import { grammarTopics } from "@/lib/learning-content";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function utcStartOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export type DashboardSection = {
  href: string;
  title: string;
  text: string;
  progress: number;
  color: string;
  bar: string;
  icon: string;
};

export type DashboardSummary = {
  level: string;
  name: string;
  streak: number;
  totalXp: number;
  todayMinutes: number;
  sections: DashboardSection[];
  weeklyActivity: Array<{ day: string; minutes: number; height: number }>;
};

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const today = utcStartOfDay(new Date());

  const [exerciseStats, activityGroups, lastGrammarAttempt, todayActivity, grammarAttempts, weeklyActivities] = await prisma.$transaction([
    prisma.exerciseAttempt.groupBy({
      by: ["area"],
      _count: true,
      where: { userId: user.id },
      orderBy: { area: "asc" },
    }),
    prisma.activity.groupBy({
      by: ["kind"],
      _sum: { minutes: true },
      where: { userId: user.id },
      orderBy: { kind: "asc" },
    }),
    prisma.exerciseAttempt.findFirst({
      where: { userId: user.id, area: "grammar", topic: { not: null } },
      orderBy: { completedAt: "desc" },
      select: { topic: true },
    }),
    prisma.activity.aggregate({
      where: { userId: user.id, createdAt: { gte: today } },
      _sum: { minutes: true },
    }),
    prisma.exerciseAttempt.aggregate({
      where: { userId: user.id, area: "grammar" },
      _sum: { score: true, total: true },
    }),
    prisma.activity.findMany({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { minutes: true, createdAt: true },
    }),
  ]);

  const grammarCount = (() => {
    const item = exerciseStats.find((item) => item.area === "grammar");
    if (!item || typeof item._count === "boolean") return 0;
    return item._count?._all ?? 0;
  })();
  const readingMinutes = activityGroups.find((item) => item.kind === "reading")?._sum?.minutes ?? 0;
  const listeningMinutes = activityGroups.find((item) => item.kind === "listening")?._sum?.minutes ?? 0;
  const speakingMinutes = activityGroups.find((item) => item.kind === "speaking")?._sum?.minutes ?? 0;
  const writingSubmissions = await prisma.writingSubmission.count({ where: { userId: user.id } });

  // Calculate grammar progress from actual attempts: (correct / total) * 100
  const grammarTotal = grammarAttempts._sum.total ?? 0;
  const grammarCorrect = grammarAttempts._sum.score ?? 0;
  const grammarProgress = grammarTotal > 0 ? clampPercent((grammarCorrect / grammarTotal) * 100) : 0;

  const lastGrammarTopic = lastGrammarAttempt?.topic;
  const lastGrammarTopicLabel = lastGrammarTopic
    ? grammarTopics.find((topic) => topic.slug === lastGrammarTopic)?.shortTitle ?? "Oxirgi mashq"
    : "Yangi mashq";

  const sections: DashboardSection[] = [
    {
      href: "/grammar",
      title: "Grammatika",
      text: grammarCount > 0 ? `${grammarCount} mashq · ${lastGrammarTopicLabel}` : "Hali boshlanmadi",
      progress: grammarProgress,
      color: "bg-violet-100 text-violet-700",
      bar: "bg-violet-500",
      icon: "BookOpen",
    },
    {
      href: "/speaking",
      title: "AI suhbat",
      text: speakingMinutes > 0 ? `${speakingMinutes} daqiqa` : "Birinchi suhbat",
      progress: clampPercent((speakingMinutes / 15) * 100),
      color: "bg-emerald-100 text-emerald-700",
      bar: "bg-emerald-500",
      icon: "MessageCircle",
    },
    {
      href: "/listening",
      title: "Tinglash",
      text: listeningMinutes > 0 ? `${listeningMinutes} daqiqa` : "Audio chalib ko‘ring",
      progress: clampPercent((listeningMinutes / 15) * 100),
      color: "bg-sky-100 text-sky-700",
      bar: "bg-sky-500",
      icon: "Headphones",
    },
    {
      href: "/writing",
      title: "Yozish",
      text: writingSubmissions > 0 ? `${writingSubmissions} topshiriq` : "Birinchi matnni yozing",
      progress: clampPercent((writingSubmissions / 3) * 100),
      color: "bg-amber-100 text-amber-700",
      bar: "bg-amber-500",
      icon: "PenLine",
    },
  ];

  // Build weekly activity chart from real data.
  const dayNames = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const weeklyMinutes = new Array(7).fill(0);
  for (const activity of weeklyActivities) {
    const dayIndex = (activity.createdAt.getDay() + 6) % 7; // Monday = 0
    weeklyMinutes[dayIndex] += activity.minutes;
  }
  const maxWeekly = Math.max(...weeklyMinutes, 1);
  const weeklyActivity = dayNames.map((day, index) => ({
    day,
    minutes: weeklyMinutes[index],
    height: Math.round((weeklyMinutes[index] / maxWeekly) * 100),
  }));

  return {
    level: user.level ?? "Aniqlanmagan",
    name: user.name ?? "Til o‘rganuvchi",
    streak: user.streak ?? 0,
    totalXp: user.totalXp ?? 0,
    todayMinutes: todayActivity._sum.minutes ?? 0,
    sections,
    weeklyActivity,
  };
}
