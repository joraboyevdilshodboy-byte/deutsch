"use client";

import { BookMarked, CheckCircle2, ChevronDown, Clock3, Expand, Shrink, TextQuote } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PageIntro, QuizCard, cx } from "@/components/learning/learning-ui";
import { getReadingLessonsForLevel } from "@/lib/learning-content";
import { LEARNING_PROGRESS_EVENT, recordLearningActivity } from "@/lib/learning-progress";
import { useUserLevel } from "@/lib/user-level";

export default function ReadingPage() {
  const [level] = useUserLevel();
  const readingLessons = getReadingLessonsForLevel(level);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");
  const [notesOpen, setNotesOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const selectedLesson = readingLessons[selectedLessonIndex] ?? readingLessons[0];

  const switchLesson = (index: number) => {
    setSelectedLessonIndex(index);
    setCompleted(false);
  };

  const nextLesson = () => {
    if (!readingLessons.length) return;
    setSelectedLessonIndex((current) => (current + 1) % readingLessons.length);
    setCompleted(false);
  };

  return (
    <AppShell title="O‘qish mashqlari" subtitle="Matnni tushunish va savollar bilan mustahkamlash.">
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <PageIntro
        eyebrow="O‘qib tushunish"
        title="Imtihon darajasidagi matnlar bilan ishlang"
        description="Turli mavzularda haqiqiy va maqbul imtihon o‘qish matnlarini o‘qing, keyin atigi 15+ savol bilan tushunishingizni tekshiring."
        action={<span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><BookMarked className="size-4 text-violet-500" />{selectedLesson.level}</span>}
      />

      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">O‘qish menyusi</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Bir nechta imtihon darajasidagi matnlar orasidan tanlang.</p>
            </div>
            <button onClick={nextLesson} className="focus-ring rounded-2xl bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90">Keyingi matn</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {readingLessons.map((lesson, index) => (
              <button
                key={lesson.title}
                type="button"
                onClick={() => switchLesson(index)}
                className={cx(
                  "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                  selectedLessonIndex === index
                    ? "border-forest bg-forest text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-forest/70 hover:bg-mint/70 hover:text-forest dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                )}
              >
                {lesson.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <header className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-violet-600 dark:text-violet-300"><TextQuote className="size-4" />O‘qish matni</div>
                <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{selectedLesson.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Clock3 className="size-4" />{selectedLesson.duration}</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFontSize("normal")}
                className={cx("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition", fontSize === "normal" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")}
              >
                <Shrink className="size-3.5" /> Oddiy matn
              </button>
              <button
                type="button"
                onClick={() => setFontSize("large")}
                className={cx("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition", fontSize === "large" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")}
              >
                <Expand className="size-3.5" /> Katta matn
              </button>
            </div>
          </header>

          <div className={cx("whitespace-pre-line p-6 font-serif leading-8 text-slate-800 dark:text-slate-100 sm:p-8", fontSize === "large" ? "text-lg leading-9" : "text-base")} lang="de">
            {selectedLesson.text}
          </div>
        </article>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-3xl bg-violet-50 p-5 text-violet-950 dark:bg-violet-500/10 dark:text-violet-50">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">O‘qish strategiyasi</p>
            <ol className="mt-4 space-y-3 text-sm leading-6">
              <li className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-violet-600 text-[11px] font-bold text-white">1</span><span>Sarlavhani o‘qing va matn nima haqida ekanini taxmin qiling.</span></li>
              <li className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-violet-600 text-[11px] font-bold text-white">2</span><span>Har bir so‘zni tarjima qilmasdan, asosiy mazmunni toping.</span></li>
              <li className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-violet-600 text-[11px] font-bold text-white">3</span><span>Keyin savol uchun kerakli so‘zlarni qidiring.</span></li>
            </ol>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button type="button" onClick={() => setNotesOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left text-sm font-bold text-slate-950 dark:text-white">
              Foydali iboralar <ChevronDown className={cx("size-4 transition", notesOpen && "rotate-180")} />
            </button>
            {notesOpen ? (
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <p><strong lang="de" className="text-slate-900 dark:text-white">im Großen und Ganzen</strong> — umuman olganda</p>
                <p><strong lang="de" className="text-slate-900 dark:text-white">lauwarm</strong> — iliqqina, yetarli issiq emas</p>
                <p><strong lang="de" className="text-slate-900 dark:text-white">überprüfen</strong> — tekshirib ko‘rmoq</p>
              </div>
            ) : null}
          </section>
        </aside>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Tushunishni sinang</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Savollarga javob bering</h2>
          </div>
          {completed ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"><CheckCircle2 className="size-3.5" />Mashq saqlandi</span> : null}
        </div>
        <QuizCard
          questions={selectedLesson.questions}
          label="Matn bo‘yicha test"
          onComplete={(result) => {
            recordLearningActivity({ module: "reading", minutes: 8, correct: result.correct, attempted: result.total });
            void fetch("/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "exercise",
                area: "reading",
                score: result.correct,
                total: result.total,
                minutes: 8,
              }),
            })
              .then(() => window.dispatchEvent(new Event(LEARNING_PROGRESS_EVENT)))
              .catch(() => {});
            setCompleted(true);
          }}
        />
      </section>
    </main>
    </AppShell>
  );
}
