"use client";

import { Check, ChevronRight, RotateCcw, Sparkles, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import type { Exercise } from "@/lib/learning-content";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">{title}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cx("h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800", className)}
      aria-label={`${Math.round(safeValue)} foiz bajarildi`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  detail,
  tone = "violet",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  detail?: string;
  tone?: "violet" | "cyan" | "amber" | "emerald";
}) {
  const tones = {
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
          {detail ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p> : null}
        </div>
        <span className={cx("grid size-10 place-items-center rounded-xl", tones[tone])}>{icon}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/60 px-6 py-12 text-center dark:border-violet-500/30 dark:bg-violet-500/10">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300">
        <Sparkles className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function QuizCard({
  questions,
  onComplete,
  label = "Mini test",
  onGenerate,
}: {
  questions: Exercise[];
  onComplete?: (result: { correct: number; total: number }) => void;
  label?: string;
  onGenerate?: (count?: number) => void;
}) {
  // Deterministic shuffle based on the questions content so server and client
  // render the same order (avoids hydration mismatches). We seed a small PRNG
  // from the JSON of the questions to produce a stable permutation.
  function hashStringToSeed(str: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(a: number) {
    return function () {
      let t = (a += 0x6d2b79f5) >>> 0;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const shuffledQuestions = (() => {
    if (!questions || questions.length === 0) return [] as Exercise[];
    const seed = hashStringToSeed(JSON.stringify(questions));
    const rand = mulberry32(seed);
    const copy = [...questions];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  })();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    restart();
  }, [questions]);

  const question = shuffledQuestions[index];
  const hasFewQuestions = shuffledQuestions.length < 5;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const hasAnswered = selected !== null;
  const isCorrect = selected === question?.answer;

  function selectChoice(choice: string) {
    if (hasAnswered || !question) return;
    setSelected(choice);
    setAnswers((current) => ({ ...current, [question.id]: choice === question.answer }));
  }

  function next() {
    if (!hasAnswered) return;
    if (index === shuffledQuestions.length - 1) {
      const finalCorrect = correctCount;
      setFinished(true);
      onComplete?.({ correct: finalCorrect, total: shuffledQuestions.length });
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setAnswers({});
    setFinished(false);
  }

  if (!questions.length) return null;

  if (finished) {
    const score = Math.round((correctCount / shuffledQuestions.length) * 100);
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Check className="size-8" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Test yakunlandi</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{correctCount} / {shuffledQuestions.length} to‘g‘ri</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {score >= 80 ? "Ajoyib natija! Mavzuni ishonch bilan davom ettiring." : "Yaxshi urinish. Qoidani yana bir bor ko‘rib, testni qaytaring."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <RotateCcw className="size-4" />
              Qayta ishlash
            </button>
            {onGenerate ? (
              <button
                type="button"
                onClick={() => onGenerate()}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <RotateCcw className="size-4" />
                Yangi savollar
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">{label}</span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{index + 1} / {shuffledQuestions.length}</span>
      </div>
      {hasFewQuestions ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <div>Savollar soni hozirda kam ({shuffledQuestions.length} ta). Ko‘proq mashq qilish uchun qo‘shimcha savollar yarating.</div>
          {onGenerate ? (
            <button onClick={() => onGenerate(20)} className="ml-3 rounded-md bg-forest px-2 py-1 text-xs font-bold text-white">Ko‘proq (20) yarat</button>
          ) : (
            <button disabled className="ml-3 rounded-md bg-slate-200 px-2 py-1 text-xs font-bold text-slate-500">Ko‘proq yarating</button>
          )}
        </div>
      ) : null}
      <ProgressBar value={((index + (hasAnswered ? 1 : 0)) / shuffledQuestions.length) * 100} className="mt-4" />

      <h2 className="mt-7 text-xl font-bold leading-8 text-slate-950 dark:text-white">{question.prompt}</h2>
      {question.hint ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{question.hint}</p> : null}

      <div className="mt-6 grid gap-3">
        {question.choices.map((choice, choiceIndex) => {
          const isThisCorrect = hasAnswered && choice === question.answer;
          const isThisWrong = hasAnswered && selected === choice && choice !== question.answer;
          return (
            <button
              key={choice}
              type="button"
              disabled={hasAnswered}
              onClick={() => selectChoice(choice)}
              className={cx(
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition",
                !hasAnswered && "border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-400/70 dark:hover:bg-violet-500/10",
                isThisCorrect && "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-100",
                isThisWrong && "border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-500/15 dark:text-rose-100",
                hasAnswered && !isThisCorrect && !isThisWrong && "border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500",
              )}
            >
              <span className={cx(
                "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold",
                isThisCorrect ? "bg-emerald-600 text-white" : isThisWrong ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
              )}>
                {isThisCorrect ? <Check className="size-4" /> : isThisWrong ? <X className="size-4" /> : String.fromCharCode(65 + choiceIndex)}
              </span>
              {choice}
            </button>
          );
        })}
      </div>

      {hasAnswered ? (
        <div className={cx(
          "mt-5 rounded-2xl border p-4",
          isCorrect ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10",
        )}>
          <p className={cx("font-semibold", isCorrect ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200")}>
            {isCorrect ? "To‘g‘ri javob!" : `To‘g‘ri javob: ${question.answer}`}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{question.explanation}</p>
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={!hasAnswered}
          onClick={next}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {index === shuffledQuestions.length - 1 ? "Natijani ko‘rish" : "Keyingi savol"}
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
