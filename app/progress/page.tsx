"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { PageIntro, StatCard } from "@/components/learning/learning-ui";
import {
  LEARNING_PROGRESS_EVENT,
  getStreak,
  sevenDayActivity,
} from "@/lib/learning-progress";

export default function ProgressPage() {
  const [activity, setActivity] = useState(() => sevenDayActivity());

  useEffect(() => {
    const handleUpdate = () => setActivity(sevenDayActivity());
    window.addEventListener(LEARNING_PROGRESS_EVENT, handleUpdate);
    return () => window.removeEventListener(LEARNING_PROGRESS_EVENT, handleUpdate);
  }, []);

  const totalMinutes = activity.reduce((sum, item) => sum + item.minutes, 0);
  const totalSessions = activity.reduce((sum, item) => sum + item.completed, 0);
  const totalCorrect = activity.reduce((sum, item) => sum + item.correct, 0);
  const totalAttempted = activity.reduce((sum, item) => sum + item.attempted, 0);
  const accuracy = totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const streak = getStreak();

  const chartData = activity.map((item) => ({
    label: item.date.slice(5),
    minutes: item.minutes,
  }));

  return (
    <AppShell title="Progress" subtitle="Sizning so‘nggi o‘rganish ma’lumotlaringiz." >
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <PageIntro
          eyebrow="Statistika"
          title="O‘rganish natijalarini kuzating"
          description="Kunlik mashg‘ulotlaringiz, ketma-ketlik va so‘nggi haftalik faollikni bitta sahifada ko‘ring."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<span className="text-2xl">🔥</span>}
            label="Ketma-ket kunlar"
            value={streak}
            detail="Har kuni kamida 1 ta mashq"
          />
          <StatCard
            icon={<span className="text-2xl">⏱️</span>}
            label="Jami daqiqa"
            value={`${totalMinutes}`}
            detail="Oxirgi 7 kun ichida"
          />
          <StatCard
            icon={<span className="text-2xl">📈</span>}
            label="Aniqlik"
            value={`${accuracy}%`}
            detail="Topshiriqlardagi to‘g‘ri javoblar"
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Haftalik o‘sish</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">7 kunlik faollik grafigi</h2>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kunlik daqiqalar asosida</p>
          </div>

          <div className="h-[320px]">
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
                  contentStyle={{ borderRadius: 20, borderColor: "#e5e7eb" }}
                  formatter={(value: number) => [`${value} daqiqa`, "Mashq"]}
                  labelFormatter={(label: string) => `Sana: ${label}`}
                />
                <Area type="monotone" dataKey="minutes" stroke="#7c3aed" fill="url(#minutesGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Oxirgi mashg‘ulotlar</h2>
            <div className="mt-5 space-y-3">
              {activity.map((item) => (
                <div key={item.date} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <span>{item.date}</span>
                  <span>{item.minutes} daqiqa · {item.completed} mashq</span>
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
