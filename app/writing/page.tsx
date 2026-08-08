"use client";

import { AlertCircle, CheckCircle2, ClipboardCheck, FilePenLine, LoaderCircle, RotateCcw, Send, Sparkles, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { PageIntro, ProgressBar, cx } from "@/components/learning/learning-ui";
import { getWritingPromptsForLevel } from "@/lib/learning-content";
import { recordLearningActivity } from "@/lib/learning-progress";
import { useUserLevel } from "@/lib/user-level";

type WritingFeedback = {
  corrected_text?: string;
  mistakes?: Array<{ original?: string; correction?: string; explanation?: string }>;
  overall_feedback?: string;
  estimated_level?: string;
};

function getErrorMessage(payload: string) {
  try {
    const parsed = JSON.parse(payload) as { error?: string };
    return parsed.error || "Tekshiruvni bajarib bo‘lmadi.";
  } catch {
    return payload || "Tekshiruvni bajarib bo‘lmadi.";
  }
}

/** Clean ```json ... ``` markers and parse the JSON feedback. */
function parseFeedback(raw: string): WritingFeedback | null {
  if (!raw) return null;
  let cleaned = raw.trim();
  // Remove ```json and ``` markers if present.
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as WritingFeedback;
    if (parsed && typeof parsed === "object") return parsed;
    return null;
  } catch {
    // Try to find JSON within the text.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as WritingFeedback;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Safely render a feedback field which may be a string, an array, or an object.
 * Returns a React node that can be safely inserted in JSX without causing the
 * "Objects are not valid as a React child" error.
 */
function renderField(value: any): ReactNode {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    // Render arrays as a list of items
    return (
      <ul className="ml-3 list-disc text-sm leading-6 text-slate-700 dark:text-slate-200">
        {value.map((item, i) => (
          <li key={i}>{renderField(item)}</li>
        ))}
      </ul>
    );
  }
  // For objects, pretty-print as JSON but keep it readable
  try {
    return <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{JSON.stringify(value, null, 2)}</pre>;
  } catch {
    return String(value);
  }
}

export default function WritingPage() {
  const [level] = useUserLevel();
  const writingPrompts = getWritingPromptsForLevel(level);
  const [selectedId, setSelectedId] = useState(writingPrompts[0]?.id ?? "");
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [parsedFeedback, setParsedFeedback] = useState<WritingFeedback | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const prompt = useMemo(
    () => writingPrompts.find((item) => item.id === selectedId) ?? writingPrompts[0] ?? null,
    [selectedId, writingPrompts],
  );
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const targetMin = prompt?.id === "story-a2" || prompt?.id === "intro-a1" ? 50 : 80;
  const targetMax = prompt?.id === "story-a2" || prompt?.id === "intro-a1" ? 80 : 100;
  const wordProgress = Math.min(100, Math.round((wordCount / targetMin) * 100));

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  async function reviewWriting() {
    if (!prompt) {
      setError("Bu darajada yozish topshirig‘i mavjud emas.");
      return;
    }

    if (wordCount < 8) {
      setError("Tekshirish uchun kamida bir necha nemischa gap yozing.");
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setFeedback("");
    setParsedFeedback(null);
    setError(null);
    setIsReviewing(true);

    try {
      const response = await fetch("/api/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, task: prompt.title, level: prompt.level }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(getErrorMessage(await response.text()));
      }

      const data = await response.json();
      // Normalize feedback: API may return a string or an object. Ensure we store
      // a string for `feedback` (safe to render) and also parse structured JSON
      // when possible into `parsedFeedback`.
      let rawFeedbackStr = "";
      if (typeof data?.feedback === "string") {
        rawFeedbackStr = data.feedback;
      } else if (data?.feedback && typeof data.feedback === "object") {
        // Pretty-print object feedback for the non-parsed fallback view.
        rawFeedbackStr = JSON.stringify(data.feedback, null, 2);
      } else if (typeof data === "string") {
        rawFeedbackStr = data;
      } else if (data && typeof data === "object") {
        // Some endpoints may directly return an object containing the parsed
        // feedback (already structured). Keep a stringified copy for display
        // but also attempt to use it as parsedFeedback.
        rawFeedbackStr = JSON.stringify(data, null, 2);
      }

      setFeedback(rawFeedbackStr);

      // Try to get a structured parsedFeedback from the API response. If the
      // API already returned an object, use it directly; otherwise attempt to
      // parse any JSON embedded in the returned string.
      if (data && typeof data === "object" && !Array.isArray(data) && (data.corrected_text || data.mistakes || data.estimated_level)) {
        setParsedFeedback(data as WritingFeedback);
      } else {
        setParsedFeedback(parseFeedback(rawFeedbackStr));
      }
      recordLearningActivity({ module: "writing", minutes: Math.max(6, Math.ceil(wordCount / 14)), attempted: wordCount, correct: wordCount });
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Kutilmagan xatolik yuz berdi.");
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      setIsReviewing(false);
    }
  }

  function cancelReview() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsReviewing(false);
  }

  return (
    <AppShell title="Yozish mashqlari" subtitle="Nemischa matn yozing va AI bilan yaxshilang.">
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <PageIntro
        eyebrow="Yozish ustaxonasi"
        title="Yozing, AI bilan yaxshilang"
        description="Nemischa matningizni yozing. AI fikr-mulohazani beradi: grammatikani, tabiiy iboralarni va keyingi qadamni ko‘rasiz."
        action={<span className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200"><Sparkles className="size-4" />AI tekshiruv</span>}
      />

      <section>
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white"><FilePenLine className="size-4 text-violet-500" />Topshiriqni tanlang</div>
        <div className="grid gap-3 md:grid-cols-3">
          {writingPrompts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedId(item.id);
                setFeedback("");
                setParsedFeedback(null);
                setError(null);
              }}
              className={cx(
                "rounded-2xl border p-4 text-left transition",
                selectedId === item.id
                  ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-400 dark:bg-violet-500/10 dark:ring-violet-500/15"
                  : "border-slate-200 bg-white hover:border-violet-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/50",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-950 dark:text-white">{item.title}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.level}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.prompt}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {prompt ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">{prompt.level}</span>
                  <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">{prompt.title}</h2>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{targetMin}–{targetMax} so‘z</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">{prompt.prompt}</p>
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <label htmlFor="writing-text" className="sr-only">Nemischa javobingiz</label>
            <textarea
              id="writing-text"
              lang="de"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Schreiben Sie hier auf Deutsch…"
              className="min-h-80 w-full resize-y rounded-2xl border border-transparent bg-slate-50 p-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:bg-slate-900 dark:focus:ring-violet-500/15"
            />
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-48">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400"><span>{wordCount} so‘z</span><span>Maqsad: {targetMin}+</span></div>
                <ProgressBar value={wordProgress} className={cx("h-1.5", wordCount > targetMax && "[&>div]:from-amber-500 [&>div]:to-orange-500")} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {text ? <button type="button" onClick={() => { setText(""); setFeedback(""); setParsedFeedback(null); setError(null); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><RotateCcw className="size-4" />Tozalash</button> : null}
                {isReviewing ? (
                  <button type="button" onClick={cancelReview} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-500/25 dark:text-rose-300 dark:hover:bg-rose-500/10"><X className="size-4" />To‘xtatish</button>
                ) : (
                  <button type="button" onClick={reviewWriting} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"><Wand2 className="size-4" />AI bilan tekshirish</button>
                )}
              </div>
            </div>
          </section>

          {error ? <p role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-100"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</p> : null}

          {(feedback || isReviewing) ? (
            <section className="overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm dark:border-violet-500/25 dark:bg-slate-900">
              <header className="flex items-center justify-between gap-3 border-b border-violet-100 bg-violet-50 px-5 py-4 dark:border-violet-500/15 dark:bg-violet-500/10">
                <div className="flex items-center gap-2 text-sm font-bold text-violet-900 dark:text-violet-100"><ClipboardCheck className="size-4" />AI fikr-mulohazasi</div>
                {isReviewing ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-200"><LoaderCircle className="size-3.5 animate-spin" />Tahlil qilinmoqda…</span> : <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-200"><CheckCircle2 className="size-3.5" />Tayyor</span>}
              </header>
              <div className="p-5 sm:p-6">
                {isReviewing ? (
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Matningiz tahlil qilinmoqda…</p>
                ) : parsedFeedback ? (
                  <div className="space-y-6">
                    {parsedFeedback.estimated_level ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">Taxminiy daraja: {renderField(parsedFeedback.estimated_level)}</span>
                      </div>
                    ) : null}

                    {parsedFeedback.corrected_text ? (
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">Tuzatilgan matn</h3>
                        <div lang="de" className="mt-2 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100">{renderField(parsedFeedback.corrected_text)}</div>
                      </div>
                    ) : null}

                    {parsedFeedback.mistakes && parsedFeedback.mistakes.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">Xatolar ({parsedFeedback.mistakes.length})</h3>
                        <div className="mt-3 space-y-3">
                          {parsedFeedback.mistakes.map((mistake, index) => (
                            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                              <div className="flex flex-wrap items-start gap-2">
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">Xato</span>
                                <span lang="de" className="text-sm font-semibold text-rose-800 line-through dark:text-rose-200">{renderField(mistake.original)}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-start gap-2">
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Tuzatish</span>
                                <span lang="de" className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{renderField(mistake.correction)}</span>
                              </div>
                              {mistake.explanation ? (
                                <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{renderField(mistake.explanation)}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {parsedFeedback.overall_feedback ? (
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">Umumiy fikr-mulohaza</h3>
                        <div className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{renderField(parsedFeedback.overall_feedback)}</div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{feedback}</div>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-violet-950/10">
            <Send className="size-5 text-violet-300" />
            <h2 className="mt-4 text-lg font-bold">Yozish formulasi</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Avval fikrni sodda gap bilan ayting. Keyin sabab yoki misol bering. Oxirida xulosa qiling.</p>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">Bu topshiriq uchun eslatma</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {prompt.helper.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-500" />{item}</li>)}
            </ul>
          </section>
          <p className="rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">AI tavsiyasi o‘quv yordami sifatida beriladi. Eng yaxshi natija uchun fikr-mulohazani o‘qib, matningizni o‘zingiz qayta yozing.</p>
        </aside>
      </section>
    </main>
    </AppShell>
  );
}