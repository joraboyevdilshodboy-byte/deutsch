"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageIntro, StatCard } from "@/components/learning/learning-ui";
import { LEARNING_PROGRESS_EVENT } from "@/lib/learning-progress";
import { startSiteActivityTracking } from "@/lib/site-activity";

type ChartDay = {
  date: string;
  label: string;
  minutes: number;
  correct: number;
  attempted: number;
  height: number;
};

type ProgressData = {
  weekStart: string;
  weekEnd: string;
  isCurrentWeek: boolean;
  streak: number;
  totalMinutes: number;
  todayMinutes: number;
  siteMinutes: number;
  accuracy: number;
  chartData: ChartDay[];
};

function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekRange(weekStart: string) {
  const start = parseDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const monthNames = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
  ];

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  }

  return `${start.getDate()} ${monthNames[start.getMonth()]} – ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
}

function currentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
  return formatDateKey(monday);
}

function addWeeks(weekStart: string, weeks: number): string {
  const date = parseDate(weekStart);
  date.setDate(date.getDate() + weeks * 7);
  return formatDateKey(date);
}

export default function ProgressPage() {
  const [weekStart, setWeekStart] = useState<string>(() => currentWeekStart());
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWeek = useCallback(async (start: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/progress?weekStart=${start}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Ma'lumotlarni yuklab bo'lmadi.");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWeek(weekStart);
  }, [weekStart, loadWeek]);

  useEffect(() => {
    const cleanup = startSiteActivityTracking();
    return () => cleanup();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      // Only refresh data if we're looking at the current week.
      setWeekStart((current) => {
        if (current === currentWeekStart()) {
          void loadWeek(current);
        }
        return current;
      });
    };
    window.addEventListener(LEARNING_PROGRESS_EVENT, handleUpdate);
    return () => window.removeEventListener(LEARNING_PROGRESS_EVENT, handleUpdate);
  }, [loadWeek]);

  const goPreviousWeek = () => setWeekStart((current) => addWeeks(current, -1));
  const goNextWeek = () => {
    setWeekStart((current) => {
      const next = addWeeks(current, 1);
      return next <= currentWeekStart() ? next : current;
    });
  };

  const isCurrentWeek = data?.isCurrentWeek ?? weekStart === currentWeekStart();
  const chartData = data?.chartData ?? [];
  const totalMinutes = data?.totalMinutes ?? 0;
  const todayMinutes = data?.todayMinutes ?? 0;
  const siteMinutes = data?.siteMinutes ?? 0;
  const accuracy = data?.accuracy ?? 0;
  const streak = data?.streak ?? 0;

  return (
    <AppShell title="Progress" subtitle="Sizning so‘nggi o‘rganish ma’lumotlaringiz.">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <PageIntro
          eyebrow="Statistika"
          title="O‘rganish natijalarini kuzating"
          description="Kunlik mashg‘ulotlaringiz, ketma-ketlik va haftalik faollikni bitta sahifada ko‘ring."
        />

        {/* Week navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={goPreviousWeek}
            className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-mint hover:text-forest dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Oldingi hafta"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-56 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {weekStart ? formatWeekRange(weekStart) : ""}
            </p>
            {isCurrentWeek && (
              <span className="mt-1 inline-block rounded-full bg-mint px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-forest">
                Joriy hafta
              </span>
            )}
          </div>
          <button
            onClick={goNextWeek}
            disabled={isCurrentWeek}
            className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-mint hover:text-forest disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Keyingi hafta"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<span className="text-2xl">🔥</span>}
            label="Ketma-ket kunlar"
            value={streak}
            detail="Har kuni kamida 1 ta mashq"
          />
          <StatCard
            icon={<span className="text-2xl">⏱️</span>}
            label="Bugungi daqiqa"
            value={`${todayMinutes}`}
            detail="Bosh sahifa bilan bir xil"
          />
          <StatCard
            icon={<span className="text-2xl">🌐</span>}
            label="Saytda o‘tilgan vaqt"
            value={`${siteMinutes} min`}
            detail="Barcha faoliyatlaringizdan"
          />
          <StatCard
            icon={<span className="text-2xl">📈</span>}
            label="Aniqlik"
            value={`${accuracy}%`}
            detail="Topshiriqlardagi to‘g‘ri javoblar"
          />
        </div>

        {/* Chart */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Haftalik o‘sish</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">7 kunlik faollik grafigi</h2>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saytda o‘tkazilgan kunlik daqiqalar</p>
          </div>

          <div className="relative h-[320px]">
            {loading && (
              <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                <Loader2 className="h-8 w-8 animate-spin text-forest" />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-rose-50/80 backdrop-blur-sm">
                <p className="max-w-sm px-6 text-center text-sm font-semibold text-rose-600">{error}</p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 20, borderColor: "#e5e7eb", boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)" }}
                  formatter={(value: number) => [`${value} daqiqa`, "Kunlik vaqt"]}
                  labelFormatter={(label: string) => {
                    const item = chartData.find((d) => d.label === label);
                    return item ? `${item.date} · ${label}` : label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  fill="url(#minutesGradient)"
                  dot={{ fill: "#7c3aed", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#5b21b6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Daily breakdown */}
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Kunlik taqsimot</h2>
            <div className="mt-5 space-y-3">
              {chartData.length === 0 && (
                <p className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  Bu haftada hali faollik yo‘q.
                </p>
              )}
              {chartData.map((item) => (
                <div key={item.date} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-xs font-extrabold uppercase text-slate-500">{item.label}</span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <span className="font-bold">
                    {item.minutes > 0 ? `${item.minutes} daqiqa` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-mint p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-forest">Progress maslahati</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">Har kuni kamida 10 daqiqa amaliy mashq qiling. Agar bugun kamroq bo‘lsa, ertaga yana davom eting — uzluksizlik eng muhimidir.</p>
            <div className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <p>• Grammatikani 2 kundan ko‘p kutib qo‘ymang.</p>
              <p>• Bir mashq turi kamroq ketayotganda, boshqa turdan yana boshlang.</p>
              <p>• Yozish va tinglashni har hafta qayta ko‘rib chiqing.</p>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}