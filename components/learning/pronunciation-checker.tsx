"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Info,
  Loader2,
  Mic,
  MicOff,
  Play,
  RefreshCw,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

type WordFeedback = {
  word: string;
  status: "correct" | "warning" | "incorrect";
  feedback?: string;
};

type PronunciationResult = {
  score: number;
  words: WordFeedback[];
  phoneticTips: string[];
  overallFeedback: string;
  xpEarned?: number;
};

const PRACTICE_PHRASES: Record<string, string[]> = {
  A1: [
    "Guten Tag! Wie geht es Ihnen?",
    "Ich heiße Alex und komme aus Uzbekistan.",
    "Entschuldigung, wo ist der Bahnhof?",
    "Ich möchte ein Buch lesen.",
    "Das Wetter heute ist sehr schön.",
  ],
  A2: [
    "Ich lerne seit drei Monaten Deutsch.",
    "Können Sie das bitte noch einmal wiederholen?",
    "Am Wochenende gehe ich gern im Park spazieren.",
    "Ich hätte gerne einen Kaffee mit Milch.",
    "Wir fahren nächsten Sommer nach Berlin.",
  ],
  B1: [
    "Obwohl es regnet, mache ich einen langen Spaziergang.",
    "Je mehr man übt, desto besser wird die Aussprache.",
    "Ich interessiere mich sehr für die deutsche Kultur.",
    "Es ist wichtig, jeden Tag neue Vokabeln zu lernen.",
    "Könnten Sie mir bitte sagen, wann der Zug ankommt?",
  ],
  B2: [
    "Die Digitalisierung verändert unsere Arbeitswelt grundlegend.",
    "Ich bin davon überzeugt, dass Sprachen Türen zu neuen Welten öffnen.",
    "Unter diesen Umständen sollten wir eine vorsichtige Entscheidung treffen.",
    "Es lässt sich nicht leugnen, dass das Erlernen einer Fremdsprache Zeit erfordert.",
  ],
  C1: [
    "Nichtsdestotrotz verdanken wir dieser Entwicklung bemerkenswerte Fortschritte.",
    "Die Komplexität dieser Thematik erfordert eine differenzierte Betrachtungsweise.",
    "Aus meiner Sicht spiegelt diese Debatte gesellschaftliche Strömungen wider.",
  ],
};

interface PronunciationCheckerProps {
  userLevel?: string;
}

export function PronunciationChecker({ userLevel = "A2" }: PronunciationCheckerProps) {
  const currentLevelKey = PRACTICE_PHRASES[userLevel] ? userLevel : "A2";
  const phrases = PRACTICE_PHRASES[currentLevelKey];

  const [selectedPhrase, setSelectedPhrase] = useState(phrases[0]);
  const [customPhrase, setCustomPhrase] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const targetPhrase = isCustomMode ? customPhrase.trim() || selectedPhrase : selectedPhrase;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "de-DE";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setTranscript(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const speakNativeText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setError("Brauzeringiz matnni ovozga aylantirishni qo'llab-quvvatlamaydi.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.85; // Slightly slower for clear learning
    utterance.pitch = 1.0;

    try {
      const voices = window.speechSynthesis.getVoices();
      const germanVoice = voices.find((v) => v.lang.toLowerCase().startsWith("de")) || voices[0];
      if (germanVoice) utterance.voice = germanVoice;
    } catch {
      // ignore fallback
    }

    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    setError("");
    setTranscript("");
    setResult(null);
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];

    // Check media devices
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // ignore if already started
        }
      }

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Mikrofonga ruxsat berilmadi. Iltimos, mikrofonga ruxsat berib, qayta urinib ko'ring.");
    }
  };

  const stopRecordingAndAnalyze = async () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Wait 400ms for final transcript processing
    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const finalSpoken = transcript.trim() || targetPhrase;

    try {
      const response = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetText: targetPhrase,
          spokenText: finalSpoken,
          level: userLevel,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Talaffuzni tahlil qilib bo'lmadi.");
      }

      const data: PronunciationResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
    } finally {
      setAnalyzing(false);
    }
  };

  const playRecordedAudio = () => {
    if (!audioUrl) return;
    if (recordedAudioElementRef.current) {
      recordedAudioElementRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    recordedAudioElementRef.current = audio;
    setIsPlayingRecorded(true);

    audio.onended = () => setIsPlayingRecorded(false);
    audio.onerror = () => setIsPlayingRecorded(false);
    audio.play();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 65) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="space-y-6">
      {/* Phrase Selection Header */}
      <div className="app-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-extrabold text-forest">
                {currentLevelKey} Daraja
              </span>
              <h2 className="text-xl font-black text-ink">Talaffuzni AI bilan Tekshirish</h2>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Nemischa gapni eshiting, mikrofonga aytib bering va AI dan aniq ball hamda takliflar oling.
            </p>
          </div>
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="focus-ring rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-forest/30 hover:bg-mint hover:text-forest"
          >
            {isCustomMode ? "Mavjud gaplardan tanlash" : "✏️ O'zim gap yozish"}
          </button>
        </div>

        {/* Target Phrase Box */}
        <div className="mt-5 space-y-4">
          {!isCustomMode ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Nemischa mashq iboralari:
              </label>
              <div className="grid gap-2.5 sm:grid-cols-1 md:grid-cols-2">
                {phrases.map((phrase) => {
                  const isSelected = selectedPhrase === phrase;
                  return (
                    <button
                      key={phrase}
                      onClick={() => {
                        setSelectedPhrase(phrase);
                        setResult(null);
                        setTranscript("");
                        setError("");
                      }}
                      className={`focus-ring flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                        isSelected
                          ? "border-forest bg-mint text-forest shadow-sm"
                          : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <span>{phrase}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakNativeText(phrase);
                        }}
                        className="ml-2 shrink-0 rounded-xl p-2 text-forest hover:bg-forest/10"
                        title="Nemischa talaffuzni eshitish"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                O'zingiz mashq qilmoqchi bo'lgan nemischa gapni yozing:
              </label>
              <textarea
                value={customPhrase}
                onChange={(e) => setCustomPhrase(e.target.value)}
                placeholder="Masalan: Ich trinke gerne Tee am Morgen."
                rows={2}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-ink placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Target Phrase Active Banner */}
          <div className="rounded-2xl border border-forest/20 bg-forest/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-forest/70">
                  Talaffuz qilinadigan gap:
                </span>
                <p className="mt-1 text-lg font-black text-ink">{targetPhrase}</p>
              </div>
              <button
                onClick={() => speakNativeText(targetPhrase)}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-xs font-bold text-white hover:bg-forest/90"
              >
                <Volume2 className="h-4 w-4" /> Eshitish (TTS)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recording Area */}
      <div className="app-card p-6 text-center">
        {error && (
          <p role="alert" className="mb-4 inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        <div className="py-4">
          {!isRecording ? (
            <div className="space-y-4">
              <button
                disabled={analyzing}
                onClick={startRecording}
                className="focus-ring group relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-forest text-white shadow-xl hover:scale-105 hover:bg-forest/90 active:scale-95 disabled:opacity-50 transition-all"
              >
                <span className="absolute -inset-1 animate-ping rounded-full bg-forest/20 opacity-75" />
                <Mic className="h-10 w-10 transition-transform group-hover:scale-110" />
              </button>
              <div>
                <p className="text-base font-extrabold text-ink">Mikrofonni bosing va gapiring</p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Tugmani bosgach, yuqoridagi gapni aniq va baland ovozda talaffuz qiling.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-2xl animate-pulse">
                <Mic className="h-10 w-10" />
              </div>
              <div>
                <span className="rounded-full bg-rose-100 px-3.5 py-1 text-xs font-extrabold text-rose-700">
                  🔴 Yozib olinmoqda ({recordingTime} sek)
                </span>
                <p className="mt-3 min-h-6 text-sm font-semibold text-slate-700 italic">
                  "{transcript || "Ovozingiz eshitilmoqda..."}"
                </p>
              </div>
              <button
                onClick={stopRecordingAndAnalyze}
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                <Square className="h-4 w-4 fill-white" /> To'xtatish va Tahlil qilish
              </button>
            </div>
          )}

          {analyzing && (
            <div className="mt-4 flex flex-col items-center gap-2 text-forest">
              <Loader2 className="h-7 w-7 animate-spin" />
              <p className="text-xs font-extrabold">AI talaffuzingizni tahlil qilmoqda...</p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div className="app-card overflow-hidden p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Score & XP */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div
                className={`grid h-20 w-20 place-items-center rounded-3xl border-2 text-2xl font-black ${getScoreColor(
                  result.score
                )}`}
              >
                {result.score}%
              </div>
              <div>
                <h3 className="text-xl font-black text-ink">
                  {result.score >= 85
                    ? "🎉 Ajoyib talaffuz!"
                    : result.score >= 65
                    ? "👍 Yaxshi natija!"
                    : "💪 Takrorlash foydali bo'ladi"}
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{result.overallFeedback}</p>
              </div>
            </div>

            {result.xpEarned && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-800">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black">+{result.xpEarned} XP olindi!</span>
              </div>
            )}
          </div>

          {/* Audio Playback Controls */}
          {audioUrl && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>O'z ovozingizni qayta eshitib ko'ring:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={playRecordedAudio}
                  disabled={isPlayingRecorded}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-forest hover:text-forest disabled:opacity-60"
                >
                  <Play className="h-4 w-4" /> {isPlayingRecorded ? "Eshitilmoqda..." : "Ovozimni ijro etish"}
                </button>
                <button
                  onClick={() => speakNativeText(targetPhrase)}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-mint px-3.5 py-2 text-xs font-bold text-forest hover:bg-forest hover:text-white"
                >
                  <Volume2 className="h-4 w-4" /> Nemischa namuna bilan solishtirish
                </button>
              </div>
            </div>
          )}

          {/* Word-by-word Highlights */}
          {result.words && result.words.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                So'zma-so'z tahlil:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.words.map((item, idx) => {
                  let badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  let icon = "🟢";
                  if (item.status === "warning") {
                    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
                    icon = "🟡";
                  } else if (item.status === "incorrect") {
                    badgeStyle = "bg-rose-50 text-rose-800 border-rose-200";
                    icon = "🔴";
                  }

                  return (
                    <div
                      key={idx}
                      className={`group relative flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold ${badgeStyle}`}
                    >
                      <span>{icon}</span>
                      <span>{item.word}</span>
                      {item.feedback && (
                        <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 w-48 rounded-xl bg-ink p-2.5 text-center text-[11px] font-medium text-white shadow-xl group-hover:block z-10">
                          {item.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                💡 So'zlar ustiga bosib yoki sichqonchani olib borib tavsiyalarni ko'rishingiz mumkin.
              </p>
            </div>
          )}

          {/* Phonetic Tips */}
          {result.phoneticTips && result.phoneticTips.length > 0 && (
            <div className="rounded-2xl border border-lime/40 bg-lime/10 p-5 space-y-2">
              <div className="flex items-center gap-2 text-forest">
                <Sparkles className="h-5 w-5" />
                <h4 className="text-sm font-extrabold">Talaffuzni yaxshilash bo'yicha AI maslahatlari:</h4>
              </div>
              <ul className="ml-5 list-disc space-y-1 text-xs font-semibold leading-relaxed text-slate-700">
                {result.phoneticTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Again Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setResult(null);
                setTranscript("");
                setError("");
              }}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-xs font-extrabold text-white hover:bg-forest/90"
            >
              <RefreshCw className="h-4 w-4" /> Qayta urinib ko'rish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
