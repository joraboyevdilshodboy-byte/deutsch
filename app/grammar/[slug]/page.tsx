"use client";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Lightbulb, MessageCircleQuestion, Quote } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PageIntro, QuizCard, cx } from "@/components/learning/learning-ui";
import { Exercise, grammarTopics } from "@/lib/learning-content";
import { LEARNING_PROGRESS_EVENT, recordLearningActivity } from "@/lib/learning-progress";
import { useUserLevel } from "@/lib/user-level";

const accent = {
  violet: "from-violet-600 to-fuchsia-500 bg-violet-50 text-violet-800 dark:bg-violet-500/10 dark:text-violet-100",
  cyan: "from-cyan-600 to-sky-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-100",
  amber: "from-amber-500 to-orange-500 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-100",
  rose: "from-rose-500 to-pink-500 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-100",
  emerald: "from-emerald-600 to-teal-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100",
};

export default function GrammarTopicPage() {
  const params = useParams<{ slug: string }>();
  const [level] = useUserLevel();
  const topic = grammarTopics.find((item) => item.slug === params.slug);
  const [saved, setSaved] = useState(false);
  const [questions, setQuestions] = useState<Exercise[]>(topic?.exercises.length && topic.exercises.length >= 15 ? topic.exercises : []);
  const [loadingQuestions, setLoadingQuestions] = useState(topic?.exercises.length ? topic.exercises.length < 15 : false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function generateQuestions(finishedAll: boolean) {
    if (!topic) return;
    setGenerateError(null);
    setLoadingQuestions(true);

    try {
      const response = await fetch("/api/generate-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          count: 15,
          area: `grammar: ${topic.title}`,
          finishedAll,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Savollarni yaratib bo‘lmadi.");
      }

      const data = await response.json();
      if (Array.isArray(data.exercises) && data.exercises.length > 0) {
        const normalized = data.exercises.map((exercise: any, index: number) => {
          const prompt = String(exercise.question ?? exercise.prompt ?? "").trim();
          const answer = String(exercise.answer ?? "").trim();
          const options = Array.isArray(exercise.options) ? exercise.options.filter(Boolean).map(String) : [];
          const choices = Array.from(new Set([answer, ...options, "Der", "Die", "Das", "Den", "Dem", "ein", "eine", "einen", "einem", "einer", "kann", "kannst", "können", "könnt", "muss", "musst", "müssen", "müsst", "weil", "aber", "denn", "oder", "dass", "wenn"].filter(Boolean)));

          return {
            id: String(exercise.id ?? `${topic.slug}-gen-${index}`),
            prompt,
            choices: choices.slice(0, 4),
            answer,
            explanation: String(exercise.explanation ?? ""),
          };
        });

        setQuestions(normalized);
      } else {
        throw new Error("AI yangi savollarni yaratmadi.");
      }
    } catch (error: any) {
      setGenerateError(error?.message ?? "Savollarni olishda xatolik yuz berdi.");
      if (topic) setQuestions(topic.exercises);
    } finally {
      setLoadingQuestions(false);
    }
  }

  useEffect(() => {
    if (topic && topic.exercises.length < 15) {
      void generateQuestions(false);
    }
  }, [topic]);

  if (!topic) {
    return (
      <AppShell title="Grammatika" subtitle="Mavzu bo‘yicha mashqlar.">
      <main className="mx-auto grid min-h-[55vh] max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-md text-center">
          <BookOpen className="mx-auto size-10 text-violet-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Bu mavzu topilmadi</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Grammatika kutubxonasidan boshqa mavzuni tanlang.</p>
          <Link href="/grammar" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            <ArrowLeft className="size-4" /> Mavzularga qaytish
          </Link>
        </div>
      </main>
      </AppShell>
    );
  }

  const topicAccent = accent[topic.accent];

  return (
    <AppShell title={topic.title} subtitle="Grammatikani mashq bilan mustahkamlang.">
    <main className="mx-auto w-full max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/grammar" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-300">
        <ArrowLeft className="size-4" /> Grammatika mavzulari
      </Link>

      <PageIntro
        eyebrow={`${topic.level} · Grammatika`}
        title={topic.title}
        description={topic.description}
        action={<span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><Clock3 className="size-4 text-violet-500" />{topic.duration}</span>}
      />

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Quote className="size-5" /></span>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Misollarda ko‘ring</h2>
            </div>
            <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
              {topic.examples.map((example) => (
                <div key={example.german} className="py-4 first:pt-0 last:pb-0 sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <p className="font-semibold text-slate-950 dark:text-white">{example.german}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:mt-0 sm:text-right">{example.translation}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">Bilimingizni tekshiring</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{questions.length} savollik mashq</h2>
              </div>
              {saved ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"><CheckCircle2 className="size-3.5" />Jarayon saqlandi</span> : null}
            </div>
            {loadingQuestions ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <p className="text-sm text-slate-600 dark:text-slate-300">AI tomonidan {topic.title} uchun savollar tayyorlanmoqda. Iltimos, bir necha soniya kuting.</p>
              </div>
            ) : (
              <QuizCard
                questions={questions.length > 0 ? questions : topic.exercises}
                label={`${topic.shortTitle} testi`}
                onGenerate={() => void generateQuestions(true)}
                onComplete={(result) => {
                  recordLearningActivity({ module: "grammar", minutes: 8, correct: result.correct, attempted: result.total });
                  // Save the attempt to the database for real progress tracking.
                  void fetch("/api/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "exercise",
                      area: "grammar",
                      topic: topic.slug,
                      score: result.correct,
                      total: result.total,
                      minutes: 8,
                    }),
                  })
                    .then(() => {
                      window.dispatchEvent(new Event(LEARNING_PROGRESS_EVENT));
                    })
                    .catch(() => {});
                  setSaved(true);
                }}
              />
            )}
            {generateError ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">{generateError}</p> : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loadingQuestions}
                onClick={() => void generateQuestions(true)}
                className="focus-ring rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Yana boshqa savollar yaratish
              </button>
              <button
                type="button"
                disabled={loadingQuestions}
                onClick={() => setSaved(false)}
                className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-violet-500/60 dark:hover:bg-violet-950"
              >
                Testni qayta boshlash
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-violet-950/10">
            <MessageCircleQuestion className="size-6 text-violet-300" />
            <h2 className="mt-4 text-lg font-bold">Yodda tuting</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Xatolar o‘qishning tabiiy qismi. Javobni ko‘rgach, butun gapni ovoz chiqarib qaytaring.</p>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-950 dark:text-white">Keyingi qadam</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Mashqdan keyin shu qoida bilan 3 ta o‘zingizning gapingizni yozib ko‘ring.</p>
            <Link href="/writing" className="mt-4 inline-flex text-sm font-bold text-violet-600 hover:text-violet-700 dark:text-violet-300">Yozish mashqiga o‘tish →</Link>
          </section>
        </aside>
      </div>
    </main>
    </AppShell>
  );
}
