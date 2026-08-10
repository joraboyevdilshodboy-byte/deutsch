"use client";

import { ArrowRight, BookOpenText, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PageIntro, ProgressBar, cx } from "@/components/learning/learning-ui";
import { grammarTopics } from "@/lib/learning-content";
import { LEVELS, useUserLevel } from "@/lib/user-level";

const toneStyles = {
  violet: "from-violet-600 to-fuchsia-500 ring-violet-200 dark:ring-violet-500/20",
  cyan: "from-cyan-600 to-sky-500 ring-cyan-200 dark:ring-cyan-500/20",
  amber: "from-amber-500 to-orange-500 ring-amber-200 dark:ring-amber-500/20",
  rose: "from-rose-500 to-pink-500 ring-rose-200 dark:ring-rose-500/20",
  emerald: "from-emerald-600 to-teal-500 ring-emerald-200 dark:ring-emerald-500/20",
};

export default function GrammarPage() {
  const [level] = useUserLevel();
  const [topicProgress, setTopicProgress] = useState<Record<string, number>>({});
  const [lastTopic, setLastTopic] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      try {
        const response = await fetch("/api/grammar-progress");
        if (!response.ok) return;
        const data = (await response.json()) as { progress: Record<string, number> };
        if (cancelled) return;
        setTopicProgress(data.progress);
        // Find the most recently attempted topic.
        const keys = Object.keys(data.progress);
        if (keys.length > 0) {
          setLastTopic(keys[keys.length - 1]);
        }
      } catch {
        // Progress is best-effort.
      }
    }
    void loadProgress();
    return () => { cancelled = true; };
  }, []);

  const visibleTopics = useMemo(() => {
    return grammarTopics
      .filter((topic) => topic.level === level)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [level]);

  const continueTopic = lastTopic
    ? grammarTopics.find((topic) => topic.slug === lastTopic)
    : null;

  return (
    <AppShell title="Grammatika" subtitle="Qoidani tushuning, darhol sinab ko‘ring.">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <PageIntro
        eyebrow="Grammatika laboratoriyasi"
        title="Qoidani tushuning, darhol sinab ko‘ring"
        description="Har bir mavzu qisqa izoh, hayotiy misollar va tezkor test bilan tuzilgan. Kichik qadamlar katta ishonch beradi."
        action={
          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-100">
            <span className="font-bold">Bugungi reja:</span> 1 mavzu · 2 soat
          </div>
        }
      />

      {continueTopic ? (
        <section className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-violet-950/10 sm:px-8 sm:py-8">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100">
                <Sparkles className="size-3.5" />
                Davom ettirish
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{continueTopic.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {continueTopic.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-violet-300" />{continueTopic.duration}</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-violet-300" />{Math.round(topicProgress[continueTopic.slug] ?? 0)}% bajarilgan</span>
              </div>
            </div>
            <Link
              href={`/grammar/${continueTopic.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-100"
            >
              Mashqni ochish <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-violet-950/10 sm:px-8 sm:py-8">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100">
                <Sparkles className="size-3.5" />
                Boshlash
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Birinchi mavzuni tanlang</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Quyidagi mavzulardan birini tanlab, grammatika mashqlarini boshlang.
              </p>
            </div>
            <Link
              href="/grammar/artikel"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-100"
            >
              Boshlash <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Mavzular kutubxonasi</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Faqat joriy darajangizga mos mavzular ko‘rsatiladi.</p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{level}</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{level} bosqichi</h3>
            </div>
            <span className="inline-flex rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">{visibleTopics.length} ta mavzu</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleTopics.map((topic) => {
              const progress = topicProgress[topic.slug] ?? 0;
              return (
                <Link
                  key={topic.slug}
                  href={`/grammar/${topic.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-950/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/60"
                >
                  <div className={cx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", toneStyles[topic.accent])} />
                  <div className="flex items-start justify-between gap-4">
                    <span className={cx("grid size-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-4", toneStyles[topic.accent])}>
                      <BookOpenText className="size-5" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{topic.level}</span>
                  </div>
                  <h4 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{topic.title}</h4>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600 dark:text-slate-300">{topic.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{topic.duration}</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-300">Ochish <ArrowRight className="inline size-3.5 transition group-hover:translate-x-0.5" /></span>
                  </div>
                  {progress > 0 ? (
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400"><span>Jarayon</span><span>{Math.round(progress)}%</span></div>
                      <ProgressBar value={progress} className="h-1.5" />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500"><span>Jarayon</span><span>Boshlanmagan</span></div>
                      <ProgressBar value={0} className="h-1.5 opacity-30" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </main>
    </AppShell>
  );
}