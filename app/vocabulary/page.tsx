"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageIntro, ProgressBar } from "@/components/learning/learning-ui";
import { starterVocabulary } from "@/lib/learning-content";
import { LEVELS, useUserLevel, type UserLevel } from "@/lib/user-level";

type ReviewCard = typeof starterVocabulary[number] & {
  reviewed: boolean;
  known: boolean | null;
  nextReview?: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
};

function isUserLevel(value: unknown): value is UserLevel {
  return typeof value === "string" && LEVELS.includes(value as UserLevel);
}

function getSafeLevel(value: unknown, fallback: UserLevel): UserLevel {
  return isUserLevel(value) ? value : fallback;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[targetIndex]] = [copy[targetIndex], copy[index]];
  }
  return copy;
}

function buildQuizQuestions(cards: ReviewCard[]): QuizQuestion[] {
  if (!cards.length) return [];
  const source = cards.slice(0, Math.min(cards.length, 10));

  return source.map((card) => {
    const answer = card.uzbek;
    const candidatePool = shuffleArray(
      [
        ...source
          .filter((item) => item.id !== card.id && item.uzbek && item.uzbek !== answer)
          .map((item) => item.uzbek),
        ...starterVocabulary
          .map((item) => item.uzbek)
          .filter((value): value is string => Boolean(value))
          .filter((value) => value !== answer),
      ].filter((value, index, all) => value && all.indexOf(value) === index),
    );

    const options = [answer];
    for (const candidate of candidatePool) {
      if (options.length >= 4) break;
      if (candidate && !options.includes(candidate)) {
        options.push(candidate);
      }
    }

    if (options.length < 4) {
      const fallbackPool = shuffleArray(
        starterVocabulary
          .map((item) => item.uzbek)
          .filter((value): value is string => Boolean(value))
          .filter((value) => value !== answer && !options.includes(value))
          .filter((value, index, all) => all.indexOf(value) === index),
      );

      for (const candidate of fallbackPool) {
        if (options.length >= 4) break;
        if (candidate && !options.includes(candidate)) {
          options.push(candidate);
        }
      }
    }

    return {
      id: card.id,
      prompt: card.article ? `${card.article} ${card.german}` : card.german,
      options: shuffleArray(options),
      answer,
    };
  });
}

export default function VocabularyPage() {
  const [level] = useUserLevel();
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);

  // Load seen words from the database and filter them out.
  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        // Determine day index since first use to schedule increasing word counts: 10, 20, 30, ... cap 50
        const MS_DAY = 24 * 60 * 60 * 1000;
        const storageKey = "vocabStartDate";
        let start = localStorage.getItem(storageKey);
        if (!start) {
          start = new Date().toISOString().slice(0,10);
          localStorage.setItem(storageKey, start);
        }
        const startDate = new Date(start);
        const today = new Date();
        const daysSince = Math.floor((today.getTime() - startDate.getTime()) / MS_DAY);
        const count = Math.min(50, 10 * (1 + daysSince));

        // Ask server to generate a vocab set for today
        const resp = await fetch('/api/generate-vocab', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: 'daily', count, mode: 'mixed', level }) });
        if (!resp.ok) throw new Error('No vocab');
        const data = await resp.json();
        if (cancelled) return;

        // Use level-specific flashcards if available, otherwise fall back to starterVocabulary
        const flash = Array.isArray(data?.items?.flashcards) ? data.items.flashcards.filter((card: any) => card.level === level || !("level" in card)) : null;
        const source = Array.isArray(flash) && flash.length ? flash : starterVocabulary.filter((item) => item.level === level).slice(0, Math.min(20, count));

        const available: ReviewCard[] = source.slice(0, Math.min(source.length, count)).map((card: any) => ({
          id: card.id ?? `${card.word}`,
          german: card.word.replace(/\s*\(.*\)$/, ""),
          article: "",
          uzbek: card.translation,
          example: card.example ?? "",
          reviewed: false,
          known: null,
          category: card.category ?? "Kunlik",
          interval: card.interval ?? 1,
          nextReview: card.nextReview ?? undefined,
          level: getSafeLevel(card.level ?? level, level),
        }));

        setCards(available);
        setQuizQuestions([]);
        setQuizIndex(0);
        setQuizScore(0);
        setQuizAnswered(false);
        setQuizSelected(null);
      } catch (e) {
        // Fall back to starter vocabulary (first 10)
        const fallbackCards = starterVocabulary.filter((item) => item.level === level).slice(0, 10).map((card) => ({ ...card, reviewed: false, known: null }));
        setCards(fallbackCards);
        setQuizQuestions([]);
        setQuizIndex(0);
        setQuizScore(0);
        setQuizAnswered(false);
        setQuizSelected(null);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    void loadHistory();
    return () => { cancelled = true; };
  }, [level]);

  const remainingCount = cards.filter((card) => !card.reviewed).length;
  const completedCount = cards.length - remainingCount;
  const currentIndex = cards.findIndex((card) => !card.reviewed);
  const currentCard = cards[currentIndex] ?? null;
  const currentQuiz = quizQuestions[quizIndex] ?? null;
  const quizFinished = quizQuestions.length > 0 && quizAnswered && quizIndex === quizQuestions.length - 1;
  const quizReady = completedCount > 0 && completedCount === cards.length;

  useEffect(() => {
    if (!quizReady || !cards.length) return;
    const reviewedCards = cards.filter((card) => card.reviewed);
    if (!reviewedCards.length) return;

    const generatedQuestions = buildQuizQuestions(reviewedCards);
    setQuizQuestions(generatedQuestions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizSelected(null);
  }, [cards, quizReady]);

  function startQuiz() {
    const reviewedCards = cards.filter((card) => card.reviewed);
    if (!reviewedCards.length) return;
    const generatedQuestions = buildQuizQuestions(reviewedCards);
    setQuizQuestions(generatedQuestions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizSelected(null);
  }

  function handleQuizAnswer(option: string) {
    if (!currentQuiz || quizAnswered) return;
    setQuizSelected(option);
    setQuizAnswered(true);
    if (option === currentQuiz.answer) {
      setQuizScore((value) => value + 1);
    }
  }

  function nextQuiz() {
    if (!quizQuestions.length) return;
    if (quizFinished) {
      startQuiz();
      return;
    }

    setQuizIndex((value) => value + 1);
    setQuizAnswered(false);
    setQuizSelected(null);
  }

  async function handleReview(known: boolean) {
    if (!currentCard) return;
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vocabulary",
          word: `${currentCard.article ? `${currentCard.article} ` : ""}${currentCard.german}`,
          translation: currentCard.uzbek,
          known,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "So‘zni saqlab bo‘lmadi. Keyinroq urinib ko‘ring.");
      }

      setCards((previous) =>
        previous.map((card, index) =>
          index === currentIndex
            ? {
                ...card,
                reviewed: true,
                known,
                nextReview: result.review?.nextReview ?? card.nextReview,
              }
            : card,
        ),
      );

      setFeedback(known ? "Ajoyib! So‘z keyingi marta uzoqroq ko‘rsatiladi." : "Zo‘r! Bu so‘zni qayta ko‘proq mashq qilamiz.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "So‘zni saqlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Lug‘at" subtitle="So‘zlarni amalda yodlang va keyingi qayta ko‘rib chiqishni rejalashtiring.">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <PageIntro
          eyebrow="Lug‘at kartochkalari"
          title="Yangi so‘zlarni tez eslab qoling"
          description="Har bir kartochka ma’nosini tekshiring, natijani bosing va so‘zni keyingi qayta ko‘rib chiqish uchun saqlang."
          action={
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              {completedCount} / {cards.length} qayta ko‘rilgan
            </div>
          }
        />

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {loadingHistory ? (
              <div className="py-16 text-center text-sm font-semibold text-slate-500">Yuklanmoqda…</div>
            ) : currentCard ? (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Hozirgi kartochka</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{currentCard.german}</h2>
                  </div>
                  <div className="rounded-3xl bg-mint px-4 py-2 text-sm font-bold text-forest">{currentCard.category}</div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-3xl bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nemischa so‘z</p>
                    <p className="mt-3 text-4xl font-black tracking-tight">{currentCard.article ? `${currentCard.article} ${currentCard.german}` : currentCard.german}</p>
                    <div className="mt-5 rounded-3xl bg-white p-4 text-sm leading-7 text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                      <p className="font-semibold">Tarjimasi</p>
                      <p className="mt-1">{currentCard.uzbek}</p>
                      <p className="mt-3 text-xs text-slate-500">Misol: {currentCard.example}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void handleReview(true)}
                      className="focus-ring rounded-3xl bg-forest px-4 py-4 text-sm font-bold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Bilaman
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void handleReview(false)}
                      className="focus-ring rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 transition hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Bilmayman
                    </button>
                  </div>

                  {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
                  {feedback ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</p> : null}

                  <section className="rounded-3xl border border-violet-200 bg-violet-50/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">So‘z o‘rganish testi</p>
                        <h3 className="mt-1 text-lg font-black text-slate-950">To‘g‘ri tarjimani tanlang</h3>
                      </div>
                      {quizReady ? (
                        <button
                          type="button"
                          onClick={startQuiz}
                          className="rounded-2xl bg-violet-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
                        >
                          {quizQuestions.length ? "Qayta boshlash" : "Boshlash"}
                        </button>
                      ) : null}
                    </div>

                    {!quizReady ? (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        Avval barcha so‘zlarni ko‘rib chiqing. Keyin tugmani bosib testni boshlang.
                      </p>
                    ) : null}

                    {currentQuiz ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            <span>Savol {quizIndex + 1} / {quizQuestions.length}</span>
                            <span>Ball: {quizScore}</span>
                          </div>
                          <p className="mt-3 text-2xl font-black text-slate-950">{currentQuiz.prompt}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentQuiz.options.map((option) => {
                            const isCorrect = option === currentQuiz.answer;
                            const isSelected = quizSelected === option;
                            const buttonStyle = quizAnswered
                              ? isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : isSelected
                                  ? "border-rose-300 bg-rose-50 text-rose-800"
                                  : "border-slate-200 bg-white text-slate-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50";

                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={quizAnswered}
                                onClick={() => handleQuizAnswer(option)}
                                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${buttonStyle}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {quizAnswered ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                            {quizSelected === currentQuiz.answer ? (
                              <p className="font-bold text-emerald-700">To‘g‘ri! Bu so‘zning tarjimasi {currentQuiz.answer}.</p>
                            ) : (
                              <p className="font-bold text-rose-700">Noto‘g‘ri. To‘g‘ri javob: {currentQuiz.answer}.</p>
                            )}
                            <button
                              type="button"
                              onClick={nextQuiz}
                              className="mt-3 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                            >
                              {quizFinished ? "Qayta boshlash" : "Keyingi savol"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-600">Testni boshlash tugmasi paydo bo‘lganida boshlab ketishingiz mumkin.</p>
                    )}
                  </section>
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <p className="text-lg font-bold">Ajoyib ish!</p>
                  <p className="mt-3 text-sm leading-6">Hamma kartochkalarni ko‘rib chiqdiz. Yangi so‘zlar qo‘shilganda yana qaytib keling.</p>
                </div>

                {(quizReady || quizQuestions.length || Boolean(currentQuiz)) ? (
                  <section className="rounded-3xl border border-violet-200 bg-violet-50/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">So‘z o‘rganish testi</p>
                        <h3 className="mt-1 text-lg font-black text-slate-950">To‘g‘ri tarjimani tanlang</h3>
                      </div>
                      {quizReady ? (
                        <button
                          type="button"
                          onClick={startQuiz}
                          className="rounded-2xl bg-violet-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
                        >
                          {quizQuestions.length ? "Qayta boshlash" : "Boshlash"}
                        </button>
                      ) : null}
                    </div>

                    {currentQuiz ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            <span>Savol {quizIndex + 1} / {quizQuestions.length}</span>
                            <span>Ball: {quizScore}</span>
                          </div>
                          <p className="mt-3 text-2xl font-black text-slate-950">{currentQuiz.prompt}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentQuiz.options.map((option) => {
                            const isCorrect = option === currentQuiz.answer;
                            const isSelected = quizSelected === option;
                            const buttonStyle = quizAnswered
                              ? isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : isSelected
                                  ? "border-rose-300 bg-rose-50 text-rose-800"
                                  : "border-slate-200 bg-white text-slate-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50";

                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={quizAnswered}
                                onClick={() => handleQuizAnswer(option)}
                                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${buttonStyle}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {quizAnswered ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                            {quizSelected === currentQuiz.answer ? (
                              <p className="font-bold text-emerald-700">To‘g‘ri! Bu so‘zning tarjimasi {currentQuiz.answer}.</p>
                            ) : (
                              <p className="font-bold text-rose-700">Noto‘g‘ri. To‘g‘ri javob: {currentQuiz.answer}.</p>
                            )}
                            <button
                              type="button"
                              onClick={nextQuiz}
                              className="mt-3 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                            >
                              {quizFinished ? "Qayta boshlash" : "Keyingi savol"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-600">Testni boshlash tugmasi paydo bo‘lganida boshlab ketishingiz mumkin.</p>
                    )}
                  </section>
                ) : null}
              </div>
            )}
          </article>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">So‘zlarni ko‘rib chiqish</p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Har bir so‘zni bilaman yoki bilmayman deb belgilash orqali keyingi o‘rganish davrini avtomatik sozlang.</p>
              <div className="mt-5 space-y-3">
                {cards.slice(0, 5).map((card) => (
                  <div key={card.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <span>{card.article ? `${card.article} ${card.german}` : card.german}</span>
                    <span className={card.reviewed ? (card.known ? "text-emerald-700" : "text-amber-700") : "text-slate-400"}>
                      {card.reviewed ? (card.known ? "Bilaman" : "Bilmayman") : "Kutmoqda"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Progress</p>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest">{completedCount}/{cards.length}</span>
              </div>
              <ProgressBar value={cards.length ? (completedCount / cards.length) * 100 : 0} />
            </section>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}