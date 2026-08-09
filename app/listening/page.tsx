"use client";

import { CircleStop, Ear, Eye, EyeOff, Headphones, Pause, Play, RotateCcw, SlidersHorizontal, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PageIntro, QuizCard, cx } from "@/components/learning/learning-ui";
import { getListeningLessonsForLevel } from "@/lib/learning-content";
import { LEARNING_PROGRESS_EVENT, recordLearningActivity } from "@/lib/learning-progress";
import { useUserLevel } from "@/lib/user-level";

const speedOptions = [
  { label: "Sekin", value: 0.82 },
  { label: "Oddiy", value: 1 },
  { label: "Tez", value: 1.16 },
];

export default function ListeningPage() {
  const [level] = useUserLevel();
  const listeningLessons = getListeningLessonsForLevel(level);
  const defaultLesson = listeningLessons[0] ?? getListeningLessonsForLevel("A1")[0];
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [transcript, setTranscript] = useState<string>(defaultLesson.transcript);
  const [questions, setQuestions] = useState<any[]>(defaultLesson.questions);
  const [topic, setTopic] = useState<string>("daily life");
  const [count, setCount] = useState<number>(3);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setTranscript(defaultLesson.transcript);
    setQuestions(defaultLesson.questions);
    setCompleted(false);
    setShowTranscript(false);
    setSpeechError(null);
  }, [defaultLesson]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function playLesson() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Brauzeringiz ovozli o‘qishni qo‘llab-quvvatlamaydi. Matnni ochib o‘qing.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = "de-DE";
    utterance.rate = speed;
    utterance.onstart = () => {
      setSpeechError(null);
      setIsPlaying(true);
    };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setSpeechError("Ovozni ishga tushirib bo‘lmadi. Brauzer ovoz sozlamalarini tekshirib, yana urinib ko‘ring.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopLesson() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
  }

  return (
    <AppShell title="Tinglash mashqlari" subtitle="Audio va matn orqali tushunish ko‘nikmasini rivojlantiring.">
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <PageIntro
        eyebrow="Tinglab tushunish"
        title="Quloqni nemischaga o‘rgating"
        description="Matnni bir necha tezlikda tinglang, keyin eshitganlaringizni savollar bilan tekshiring."
        action={<span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><Headphones className="size-4 text-violet-500" />{defaultLesson.level}</span>}
      />

      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-violet-950/15 sm:p-8">
        <div className="absolute -right-14 -top-16 size-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-3 text-violet-200">
              <Ear className="size-5" />
              <span className="text-sm font-bold uppercase tracking-[0.16em]">Bugungi audio</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{defaultLesson.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Avval matnga qaramasdan tinglang. Ikkinchi martada kalit so‘zlarni yozib oling.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-1.5">Daraja: {defaultLesson.level}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Taxminan {defaultLesson.duration}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm" style={{ color: 'black' }} placeholder="Mavzu (misol: travel, daily life, news)" />
              <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 3)))} className="ml-2 w-20 rounded-md border border-slate-200 px-3 py-2 text-sm" style={{ color: 'black' }} />
              <button disabled={generating} onClick={async () => {
                setGenerating(true);
                try {
                  const resp = await fetch('/api/generate-listening', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, level: defaultLesson.level, minutes: 2, count }) });
                  if (!resp.ok) throw new Error('AI yarata olmadi');
                  const data = await resp.json();
                  if (data.transcript) setTranscript(data.transcript);
                  if (Array.isArray(data.questions) && data.questions.length) setQuestions(data.questions);
                } catch (e) {
                  setSpeechError('Tinglash materialini yaratishda xatolik yuz berdi.');
                } finally { setGenerating(false); }
              }} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold">{generating ? 'Yaratilyapti…' : 'Yangi audio yarat'}</button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              aria-label={isPlaying ? "Audio to‘xtatish" : "Audio ijro etish"}
              onClick={isPlaying ? stopLesson : playLesson}
              className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-300/40"
            >
              {isPlaying ? <CircleStop className="size-8" /> : <Play className="ml-1 size-8 fill-current" />}
            </button>
            <span className="text-sm font-semibold text-violet-100">{isPlaying ? "O‘qilmoqda…" : "Tinglashni boshlang"}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white"><SlidersHorizontal className="size-4 text-violet-500" />Tinglash sozlamalari</div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Qiyin bo‘lsa, avval sekin tezlikdan boshlang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {speedOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                setSpeed(option.value);
                if (isPlaying) playLesson();
              }}
              className={cx(
                "rounded-xl px-3 py-2 text-sm font-semibold transition",
                speed === option.value ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
              )}
            >
              {option.label}
            </button>
          ))}
          <button type="button" onClick={isPlaying ? stopLesson : playLesson} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            {isPlaying ? <Pause className="size-4" /> : <RotateCcw className="size-4" />}
            {isPlaying ? "To‘xtatish" : "Qayta tinglash"}
          </button>
        </div>
      </section>

      {speechError ? <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">{speechError}</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Transkript</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Javoblarni berganingizdan keyin ochish tavsiya etiladi.</p>
          </div>
          <button type="button" onClick={() => setShowTranscript((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            {showTranscript ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {showTranscript ? "Yashirish" : "Matnni ko‘rsatish"}
          </button>
        </div>
        {showTranscript ? <p lang="de" className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">{transcript}</p> : null}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Eshitganingizni tekshiring</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Tushunish savollari</h2>
        </div>
        {completed ? <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"><Volume2 className="size-3.5" />Tinglash mashqi saqlandi</p> : null}
        <QuizCard
          questions={questions}
          label="Audio bo‘yicha test"
          onGenerate={async (reqCount?: number) => {
            const c = Math.max(3, Math.min(reqCount ?? 20, 50));
            setGenerating(true);
            try {
              const resp = await fetch('/api/generate-listening', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, level: defaultLesson.level, minutes: 2, count: c }) });
              if (!resp.ok) throw new Error('AI yarata olmadi');
              const data = await resp.json();
              if (data.transcript) setTranscript(data.transcript);
              if (Array.isArray(data.questions) && data.questions.length) setQuestions(data.questions);
            } catch (e) {
              setSpeechError('Qo‘shimcha savollarni yaratishda xatolik yuz berdi.');
            } finally { setGenerating(false); }
          }}
          onComplete={(result) => {
            recordLearningActivity({ module: "listening", minutes: 10, correct: result.correct, attempted: result.total });
            void fetch("/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "exercise",
                area: "listening",
                score: result.correct,
                total: result.total,
                minutes: 10,
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
