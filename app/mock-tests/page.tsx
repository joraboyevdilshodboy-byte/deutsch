"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { useUserLevel } from "@/lib/user-level";
import { buildMockQuestions, scoreMockTest, summarizeScore } from "@/lib/mock-test-utils";

export default function MockTestsPage() {
  const [level] = useUserLevel();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof scoreMockTest> | null>(null);

  const questions = useMemo(() => buildMockQuestions(level), [level]);

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    setResult(scoreMockTest(questions, answers));
    setSubmitted(true);
  };

  const summary = result ? summarizeScore(result.percentage) : null;

  return (
    <AppShell title="Mock testlar" subtitle="Turli internet manbalardan olingan namunalar asosida AI yordamida yaratilgan testlar.">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-forest">Goethe uslubidagi mock test</p>
              <h1 className="mt-2 text-2xl font-black text-ink">{level} darajasi uchun real imtihonga yaqin testlar</h1>
              <p className="mt-2 text-sm text-slate-600">Savollar Goethe Zertifikat test formatiga mos tuzilgan: gap tuzilishi, grammatik tanlov, kontekstual to‘ldirish va ko‘proq.</p>
            </div>
            <div className="rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-forest">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {questions.length} ta savol
              </div>
            </div>
          </div>
        </section>

        {submitted && result && summary ? (
          <section className="rounded-[2rem] border border-forest/10 bg-forest p-6 text-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-lime">Natija</p>
                <h2 className="mt-2 text-2xl font-black">{result.correctCount}/{result.totalQuestions} to‘g‘ri</h2>
                <p className="mt-2 text-sm text-white/80">{result.percentage}% ball · {summary.label}</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4 text-center">
                <TrendingUp className="mx-auto h-6 w-6 text-lime" />
                <p className="mt-2 text-lg font-black">{result.percentage}%</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-forest">{index + 1}. savol</p>
                  <h3 className="mt-2 text-lg font-black text-ink">{question.prompt}</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{question.difficulty}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">{question.taskType ?? "Test bo‘limi"}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">{question.difficulty}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(question.id, option)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      answers[question.id] === option
                        ? "border-forest bg-mint text-forest"
                        : "border-slate-200 bg-white text-slate-700 hover:border-forest/40 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {submitted && result ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-forest">
                    <CheckCircle2 className="h-4 w-4" />
                    To‘g‘ri javob: {question.answer}
                  </div>
                  <p className="mt-2">{question.explanation}</p>
                </div>
              ) : null}
            </div>
          ))}
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-forest px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-forest/90"
          >
            Testni yakunlash
          </button>
        </div>

        {submitted && result ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Keyingi bosqich</p>
                <h2 className="mt-2 text-xl font-black text-ink">Listening, reading va writing bo‘limlariga o‘ting</h2>
                <p className="mt-2 text-sm text-slate-600">Goethe imtihoniga tayyorgarlikni davom ettirish uchun quyidagi mashqlarni bajaring.</p>
              </div>
              <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
                <a
                  href="/listening"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-forest hover:bg-mint/30"
                >
                  Listening
                </a>
                <a
                  href="/reading"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-forest hover:bg-mint/30"
                >
                  Reading
                </a>
                <a
                  href="/writing"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-forest hover:bg-mint/30"
                >
                  Writing
                </a>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
