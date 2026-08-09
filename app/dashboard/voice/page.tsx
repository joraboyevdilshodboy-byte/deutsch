"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Mic, MicOff, PhoneOff, Settings, Volume2, VolumeX, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useUserLevel } from "@/lib/user-level";

type OrbState = "idle" | "listening" | "thinking" | "speaking";

const STATUS_LABELS: Record<OrbState, string> = {
  idle: "Orbni bosib gapiring",
  listening: "Tinglayapman...",
  thinking: "O'ylayapman...",
  speaking: "Gapiryapman...",
};

function LiveWaveform({ amplitude }: { amplitude: number }) {
  const bars = 28;
  return (
    <div className="flex h-12 items-center justify-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const base = 0.2 + Math.abs(Math.sin(i * 0.55)) * 0.5;
        const height = Math.max(0.08, base + amplitude * 0.9);
        return (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-forest to-lime"
            animate={{ height: `${height * 100}%`, opacity: 0.4 + amplitude * 0.6 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            style={{ height: `${base * 100}%` }}
          />
        );
      })}
    </div>
  );
}

function WaveRings({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-forest/30"
          initial={{ width: 240, height: 240, opacity: 0 }}
          animate={active ? { width: [240, 520], height: [240, 520], opacity: [0.5, 0] } : { opacity: 0 }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function Orb({
  state,
  amplitude,
  onTap,
}: {
  state: OrbState;
  amplitude: number;
  onTap: () => void;
}) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (state === "idle") {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      });
    } else if (state === "listening") {
      controls.start({
        scale: [1.04, 1.1, 1.04],
        transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
      });
    } else if (state === "thinking") {
      controls.start({
        rotate: [0, 360],
        scale: [1, 1.03, 1],
        transition: {
          rotate: { duration: 6, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
        },
      });
    } else if (state === "speaking") {
      controls.start({
        scale: [1, 1.08, 1],
        transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
      });
    }
  }, [state, controls]);

  const reactiveScale = state === "listening" ? 1 + amplitude * 0.12 : 1;

  return (
    <motion.button
      type="button"
      onClick={onTap}
      className="relative grid h-60 w-60 cursor-pointer place-items-center rounded-full outline-none sm:h-64 sm:w-64"
      animate={controls}
      style={{ scale: reactiveScale }}
      aria-label={state === "idle" ? "Ovoz rejimini boshlash" : "Ovoz rejimi"}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(24,92,72,0.3) 0%, rgba(213,239,91,0.15) 45%, transparent 70%)",
          filter: "blur(24px)",
        }}
        animate={{ opacity: state === "idle" ? 0.7 : 1 }}
      />

      <WaveRings active={state === "speaking"} />

      <motion.div
        className="absolute inset-4 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(223,245,230,0.95) 0%, rgba(24,92,72,0.85) 35%, rgba(13,60,47,0.95) 75%, rgba(8,40,32,1) 100%)",
          boxShadow:
            "0 0 60px rgba(24,92,72,0.4), 0 0 120px rgba(213,239,91,0.12), inset 0 0 40px rgba(255,255,255,0.15)",
        }}
        animate={{
          boxShadow:
            state === "speaking"
              ? [
                  "0 0 60px rgba(24,92,72,0.4), 0 0 120px rgba(213,239,91,0.12), inset 0 0 40px rgba(255,255,255,0.15)",
                  "0 0 90px rgba(24,92,72,0.6), 0 0 160px rgba(213,239,91,0.25), inset 0 0 60px rgba(255,255,255,0.25)",
                  "0 0 60px rgba(24,92,72,0.4), 0 0 120px rgba(213,239,91,0.12), inset 0 0 40px rgba(255,255,255,0.15)",
                ]
              : "0 0 60px rgba(24,92,72,0.4), 0 0 120px rgba(213,239,91,0.12), inset 0 0 40px rgba(255,255,255,0.15)",
        }}
        transition={
          state === "speaking"
            ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5 }
        }
      />

      <motion.div
        className="absolute inset-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, transparent 50%)",
        }}
        animate={{ opacity: state === "thinking" ? [0.3, 0.6, 0.3] : 0.5 }}
        transition={
          state === "thinking"
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5 }
        }
      />

      {state === "thinking" && (
        <motion.div
          className="absolute inset-4 overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      <motion.div
        className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur-sm"
        animate={{ scale: state === "listening" ? 1 + amplitude * 0.2 : 1 }}
      >
        {state === "thinking" ? (
          <Loader2 className="h-7 w-7 text-white" />
        ) : state === "listening" ? (
          <Mic className="h-7 w-7 text-white" />
        ) : state === "speaking" ? (
          <Volume2 className="h-7 w-7 text-white" />
        ) : (
          <Mic className="h-7 w-7 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default function VoiceAIPage() {
  const [level] = useUserLevel();
  const [state, setState] = useState<OrbState>("idle");
  const [amplitude, setAmplitude] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const conversationRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const isProcessingRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopMicrophone();
      window.speechSynthesis?.cancel();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopMicrophone = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    setAmplitude(0);
  }, []);

  const startListening = useCallback(async () => {
    if (isProcessingRef.current) return;
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAmplitude = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length / 255;
        setAmplitude(Math.min(1, avg * 2.5));
        rafRef.current = requestAnimationFrame(updateAmplitude);
      };
      updateAmplitude();

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size === 0) return;

        setState("thinking");
        isProcessingRef.current = true;

        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const transcribeRes = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!transcribeRes.ok) {
            const data = await transcribeRes.json().catch(() => ({}));
            throw new Error(data.error || "Ovozni matnga aylantirib bo'lmadi.");
          }

          const { text: transcript } = await transcribeRes.json();
          if (!transcript || transcript.trim().length === 0) {
            setState("idle");
            setError("Ovoz aniqlanmadi. Qayta urinib ko'ring.");
            return;
          }

          const chatRes = await fetch("/api/voice/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: transcript,
              level: level || undefined,
              history: conversationRef.current.slice(-10),
            }),
          });

          if (!chatRes.ok) {
            const data = await chatRes.json().catch(() => ({}));
            throw new Error(data.error || "AI javob olinmadi.");
          }

          const { text: reply } = await chatRes.json();
          conversationRef.current.push({ role: "user", content: transcript });
          conversationRef.current.push({ role: "assistant", content: reply });

          await speakText(reply);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
          setState("idle");
        } finally {
          isProcessingRef.current = false;
        }
      };

      recorder.start();
      setState("listening");
    } catch (err) {
      setError("Mikrofonga ruxsat berilmadi yoki qurilma topilmadi.");
      setState("idle");
    }
  }, [level]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    stopMicrophone();
    setState("idle");
  }, [stopMicrophone]);

  const speakText = useCallback(
    (text: string) => {
      return new Promise<void>((resolve) => {
        if (!("speechSynthesis" in window)) {
          setError("Brauzeringiz matnni ovozga aylantirishni qo'llab-quvvatlamaydi.");
          resolve();
          return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "de-DE";
        utterance.rate = speechRate;
        utterance.pitch = 1;
        utterance.volume = isMuted ? 0 : 1;

        try {
          const voices = window.speechSynthesis.getVoices();
          const preferred = voices.find((voice) => voice.lang.toLowerCase().startsWith("de")) ?? voices[0];
          if (preferred) utterance.voice = preferred;
        } catch {
          // ignore
        }

        utteranceRef.current = utterance;
        setState("speaking");

        utterance.onstart = () => {
          setState("speaking");
        };
        utterance.onend = () => {
          utteranceRef.current = null;
          setState("idle");
          resolve();
        };
        utterance.onerror = () => {
          utteranceRef.current = null;
          setState("idle");
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [speechRate, isMuted],
  );

  const handleOrbTap = useCallback(() => {
    if (state === "idle") {
      void startListening();
    } else if (state === "listening") {
      stopListening();
    } else if (state === "speaking") {
      window.speechSynthesis?.cancel();
      setState("idle");
    }
  }, [state, startListening, stopListening]);

  const endCall = useCallback(() => {
    window.speechSynthesis?.cancel();
    stopMicrophone();

    // Record this voice session for real progress tracking.
    const messageCount = conversationRef.current.length;
    if (messageCount > 0) {
      const minutes = Math.max(1, Math.round(messageCount * 1.5));
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "session",
          activityType: "voice",
          durationMinutes: minutes,
        }),
      })
        .then(() => {
          window.dispatchEvent(new Event("deutsch-gg-learning-progress"));
        })
        .catch(() => {});
    }

    conversationRef.current = [];
    setState("idle");
    setError("");
  }, [stopMicrophone]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (utteranceRef.current) {
        utteranceRef.current.volume = next ? 0 : 1;
      }
      return next;
    });
  }, []);

  return (
    <AppShell title="Voice AI" subtitle="Nemis tilini gapirib o'rganing">
      <div className="relative flex min-h-[calc(100vh-13rem)] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-forest/10 bg-gradient-to-b from-mint/60 via-paper to-paper px-4 py-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border-[30px] border-forest/5" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full border-[36px] border-lime/10" />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 max-w-sm rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-xs font-semibold text-rose-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center">
          <Orb state={state} amplitude={amplitude} onTap={handleOrbTap} />

          <motion.p
            key={state}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 text-sm font-extrabold tracking-wide text-forest"
          >
            {STATUS_LABELS[state]}
          </motion.p>

          <div className="mt-4 h-12 w-64">
            {state === "listening" ? <LiveWaveform amplitude={amplitude} /> : null}
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-28 z-20 w-72 rounded-2xl border border-forest/10 bg-white p-4 shadow-soft"
            >
              <p className="text-xs font-extrabold uppercase tracking-wider text-forest/70">
                Ovoz tezligi
              </p>
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.1}
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="mt-3 w-full accent-forest"
              />
              <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-500">
                <span>Sekin</span>
                <span>{speechRate.toFixed(1)}x</span>
                <span>Tez</span>
              </div>
              <button
                onClick={toggleMute}
                className="mt-4 flex w-full items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-mint hover:text-forest"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isMuted ? "Ovoz o'chiq" : "Ovoz yoqilgan"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-center gap-5 sm:gap-7">
          <button
            onClick={() => (state === "listening" ? stopListening() : void startListening())}
            disabled={state === "thinking"}
            className={`grid h-14 w-14 place-items-center rounded-full border-2 transition-all sm:h-16 sm:w-16 ${
              state === "listening"
                ? "border-rose-300 bg-rose-50 text-rose-600 shadow-lg shadow-rose-200"
                : "border-forest/15 bg-white text-forest shadow-soft hover:bg-mint hover:border-forest/30"
            } disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label={state === "listening" ? "Mikrofoni to'xtatish" : "Mikrofoni yoqish"}
          >
            {state === "listening" ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button
            onClick={endCall}
            className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-forest to-[#0d3c2f] text-white shadow-xl shadow-forest/30 transition hover:scale-105 hover:shadow-forest/50 sm:h-[4.5rem] sm:w-[4.5rem]"
            aria-label="Suhbatni tugatish"
          >
            <PhoneOff className="h-6 w-6" />
          </button>

          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className={`grid h-14 w-14 place-items-center rounded-full border-2 transition-all sm:h-16 sm:w-16 ${
              showSettings
                ? "border-forest bg-forest text-white shadow-lg shadow-forest/30"
                : "border-forest/15 bg-white text-forest shadow-soft hover:bg-mint hover:border-forest/30"
            }`}
            aria-label="Sozlamalar"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}