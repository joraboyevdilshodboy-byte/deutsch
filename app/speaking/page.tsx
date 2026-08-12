"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, Loader2, MessageSquarePlus, Mic, Send, Sparkles, Trash2, Volume2, VolumeX } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PronunciationChecker } from "@/components/learning/pronunciation-checker";
import { LEARNING_PROGRESS_EVENT } from "@/lib/learning-progress";
import { useUserLevel } from "@/lib/user-level";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; correction?: string; translation?: string };
type ChatSession = { id: string; title: string; messages: ChatMessage[]; createdAt: string };

const starters = ["Hallo! Ich möchte heute über meinen Alltag sprechen.", "Was machst du gern am Wochenende?", "Kannst du mir eine Frage über Reisen stellen?"];

function createId() {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  }

  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createSession(title: string): ChatSession {
  return {
    id: createId(),
    title,
    createdAt: new Date().toISOString(),
    messages: [{ id: "welcome", role: "assistant", content: "Hallo! Ich bin dein Deutschlehrer. Worüber möchtest du heute sprechen? Du kannst auf Deutsch oder Uzbekisch schreiben." }],
  };
}

function cleanStreamPart(value: string): { text: string; correction?: string } {
  const trimmed = value.replace(/^data:\s?/, "").trim();
  if (!trimmed || trimmed === "[DONE]") return { text: "" };
  try {
    const parsed = JSON.parse(trimmed) as { text?: string; value?: string; correction?: string; type?: string };
    if (parsed.type === "meta") return { text: "", correction: parsed.correction };
    return { text: parsed.text ?? parsed.value ?? "", correction: parsed.correction };
  } catch { return { text: value.replace(/^data:\s?/, "") }; }
}

export default function SpeakingPage() {
  const [level] = useUserLevel();
  const [activeTab, setActiveTab] = useState<"chat" | "pronunciation">("chat");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState(""); const [thinking, setThinking] = useState(false); const [persona, setPersona] = useState<string>("default");
  const [preppyResult, setPreppyResult] = useState<any | null>(null);

  // Persist persona selection in localStorage so preference survives reload.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferredPersona");
      if (saved) setPersona(saved);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("preferredPersona", persona);
    } catch {
      // ignore
    }
  }, [persona]);
  const [error, setError] = useState(""); const [autoSpeak, setAutoSpeak] = useState(true);
  const [messageViews, setMessageViews] = useState<Record<string, "original" | "translation">>({});
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("speaking-sessions");
      const activeStoredId = localStorage.getItem("speaking-active-session-id");
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length) {
          const nextActiveId = parsed.some((session) => session.id === activeStoredId) ? activeStoredId : parsed[0].id;
          setSessions(parsed);
          setActiveSessionId(nextActiveId);
          return;
        }
      }
      const initialSession = createSession("Yangi suhbat");
      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);
    } catch {
      const initialSession = createSession("Yangi suhbat");
      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);
    }
  }, []);

  useEffect(() => {
    if (!activeSessionId || !sessions.length) return;
    localStorage.setItem("speaking-sessions", JSON.stringify(sessions));
    localStorage.setItem("speaking-active-session-id", activeSessionId);
  }, [activeSessionId, sessions]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, thinking]);

  function startNewSession() {
    const nextSession = createSession(`Suhbat ${sessions.length + 1}`);
    setSessions((current) => [nextSession, ...current]);
    setActiveSessionId(nextSession.id);
    setError("");
  }

  function removeSession(sessionId: string) {
    const targetSession = sessions.find((session) => session.id === sessionId);
    if (!targetSession) return;

    setSessions((current) => {
      const remaining = current.filter((session) => session.id !== sessionId);
      if (remaining.length === 0) {
        const fallback = createSession("Yangi suhbat");
        setActiveSessionId(fallback.id);
        return [fallback];
      }

      const nextActive = activeSessionId === sessionId ? remaining[0].id : activeSessionId;
      setActiveSessionId(nextActive);
      return remaining;
    });
    setError("");
  }

  function updateActiveSessionMessages(updater: (current: ChatMessage[]) => ChatMessage[]) {
    if (!activeSessionId) return;
    setSessions((current) => current.map((session) => (session.id === activeSessionId ? { ...session, messages: updater(session.messages) } : session)));
  }

  async function toggleMessageView(messageId: string, content: string) {
    const currentView = messageViews[messageId] ?? "original";
    if (currentView === "translation") {
      setMessageViews((current) => ({ ...current, [messageId]: "original" }));
      return;
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, target: "uz" }),
      });

      if (!response.ok) {
        throw new Error("Tarjima olinmadi");
      }

      const data = await response.json().catch(() => null);
      const translation = data?.translation ?? content;
      setMessageViews((current) => ({ ...current, [messageId]: "translation" }));
      setSessions((current) => current.map((session) => (session.id === activeSessionId ? {
        ...session,
        messages: session.messages.map((message) => message.id === messageId ? { ...message, translation } : message),
      } : session)));
    } catch {
      setError("Tarjima olinmadi. Qayta urinib ko‘ring.");
    }
  }

  const speakText = (content: string) => {
    if (!("speechSynthesis" in window)) { setError("Brauzeringiz matnni ovozga aylantirish funksiyasini qo‘llab-quvvatlamaydi."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "de-DE";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    try {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((voice) => voice.lang.toLowerCase().startsWith("de")) ?? voices[0];
      if (preferred) utterance.voice = preferred;
    } catch {
      // Ignore voice lookup issues and let the browser fall back to its default speech engine.
    }

    window.speechSynthesis.speak(utterance);
  };
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);


  const sendMessage = async (event?: FormEvent<HTMLFormElement>, value = input) => {
    event?.preventDefault(); const message = value.trim(); if (!message || thinking) return;
    setError(""); setInput(""); setThinking(true);
    if (!activeSessionId) {
      const fallbackSession = createSession("Yangi suhbat");
      setSessions([fallbackSession]);
      setActiveSessionId(fallbackSession.id);
      return;
    }
    const userMessage: ChatMessage = { id: createId(), role: "user", content: message };
    const assistantId = createId();
    const assistantMessage: ChatMessage = { id: assistantId, role: "assistant", content: "" };
    const nextMessages: ChatMessage[] = [...(messages ?? []), userMessage, assistantMessage];
    const title = messages.length <= 1 ? message.slice(0, 28) : undefined;
    setSessions((current) => current.map((session) => session.id === activeSessionId ? { ...session, title: title ?? session.title, messages: nextMessages } : session));

    // Send the user's message to grammar-check in background to get corrections for the transcript.
    (async () => {
      try {
        const resp = await fetch("/api/grammar-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message, level: level || undefined }) });
        if (resp.ok) {
          const data = await resp.json().catch(() => null);
          const parsed = data?.feedback ?? null;
          if (parsed && parsed.mistakes && parsed.mistakes.length) {
            const correctionSummary = parsed.mistakes.map((m: any) => `${m.original || m.correction} → ${m.correction}`).slice(0, 5).join('; ');
            updateActiveSessionMessages((current) => current.map((item) => item.id === userMessage.id ? { ...item, correction: correctionSummary } : item));
          }
        }
      } catch (err) {
        // ignore grammar-check failures here
      }
    })();

    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, persona, level }) });
      if (!response.ok || !response.body) { const data = await response.json().catch(() => ({})); throw new Error(data.error || "AI javobi olinmadi."); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let fullText = ""; let pending = ""; let correction = "";
      const update = (part: string) => { if (!part) return; const result = cleanStreamPart(part); fullText += result.text; correction = result.correction || correction; updateActiveSessionMessages((current) => current.map((item) => item.id === assistantId ? { ...item, content: fullText, correction } : item)); };
      while (true) {
        const { done, value: chunk } = await reader.read(); if (done) break;
        pending += decoder.decode(chunk, { stream: true });
        const lines = pending.split("\n"); pending = lines.pop() ?? "";
        // Plain text streams have no newline framing; keep the text visible immediately.
        if (lines.length === 0 && !response.headers.get("content-type")?.includes("event-stream")) { update(pending); pending = ""; }
        else lines.forEach(update);
      }
      if (pending) update(pending);
      if (!fullText) throw new Error("AI bo‘sh javob qaytardi. Iltimos, qayta urinib ko‘ring.");

      // If persona is preppy, attempt to parse structured JSON response embedded at the end
      // of the assistant's reply. Many exam-style prompts append a JSON blob with band/model_answer.
      if (persona === "preppy") {
        try {
          const match = fullText.match(/(\{[\s\S]*\})\s*$/);
          if (match) {
            const parsed = JSON.parse(match[1]);
            setPreppyResult(parsed);
          } else {
            setPreppyResult(null);
          }
        } catch (e) {
          // If parsing fails, keep preppyResult null but do not block the chat.
          setPreppyResult(null);
        }
      } else {
        setPreppyResult(null);
      }

      if (autoSpeak) speakText(fullText);
      void fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "activity", kind: "speaking", minutes: 3 }) })
        .then(() => window.dispatchEvent(new Event(LEARNING_PROGRESS_EVENT)))
        .catch(() => {});
    } catch (cause) {
      updateActiveSessionMessages((current) => current.filter((item) => item.id !== assistantId));
      setError(cause instanceof Error ? cause.message : "Suhbatni davom ettirib bo‘lmadi.");
    } finally { setThinking(false); }
  };

  return (
    <AppShell title="Gapirish va Talaffuz" subtitle="Nemischa muloqot qiling va AI yordamida talaffuzingizni baholang.">
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-100 p-1.5 w-fit">
        <button
          onClick={() => setActiveTab("chat")}
          className={`focus-ring flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
            activeTab === "chat" ? "bg-forest text-white shadow-sm" : "text-slate-600 hover:text-ink"
          }`}
        >
          <Bot className="h-4 w-4" /> AI Coach Chat
        </button>
        <button
          onClick={() => setActiveTab("pronunciation")}
          className={`focus-ring flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
            activeTab === "pronunciation" ? "bg-forest text-white shadow-sm" : "text-slate-600 hover:text-ink"
          }`}
        >
          <Mic className="h-4 w-4" /> Talaffuzni Tekshirish
        </button>
      </div>

      {activeTab === "pronunciation" ? (
        <PronunciationChecker userLevel={level} />
      ) : (
        <div className="flex flex-col gap-6 xl:grid xl:h-[calc(100dvh-12rem)] xl:min-h-[420px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="app-card flex min-h-[420px] min-h-0 flex-col overflow-hidden xl:h-full">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-lime text-forest"><Bot className="h-5 w-5" /><i className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" /></span><div><h2 className="text-sm font-extrabold text-ink">Deutsch Coach</h2><p className="text-xs font-semibold text-emerald-600">● Onlayn · A2–B1</p></div></div><div className="flex items-center gap-2"><button onClick={startNewSession} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-forest hover:text-forest" title="Yangi chat ochish"><MessageSquarePlus className="h-4 w-4" /> <span className="hidden sm:inline">Yangi chat</span></button><button onClick={() => setAutoSpeak(!autoSpeak)} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-mint hover:text-forest" title="Avtomatik ovoz"><>{autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</> <span className="hidden sm:inline">Ovoz {autoSpeak ? "yoqilgan" : "o‘chiq"}</span></button></div></div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fcfcf8] px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-0.5 pr-1 [scrollbar-gutter:stable]">
              <div className="flex flex-col gap-4">
                {preppyResult ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    {preppyResult.band ? <div className="text-sm font-bold">Taxminiy band: {String(preppyResult.band)}</div> : null}
                    {preppyResult.model_answer ? (
                      <div className="mt-2">
                        <h4 className="font-semibold">Model javob</h4>
                        <div className="mt-1 whitespace-pre-wrap text-sm">{String(preppyResult.model_answer)}</div>
                      </div>
                    ) : null}
                    {preppyResult.suggestions ? (
                      <div className="mt-2">
                        <h4 className="font-semibold">Takliflar</h4>
                        <ul className="ml-4 list-disc text-sm">
                          {(Array.isArray(preppyResult.suggestions) ? preppyResult.suggestions : [preppyResult.suggestions]).map((s: any, i: number) => (
                            <li key={i}>{String(s)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {messages.map((message) => {
                  const viewMode = message.role === "assistant" ? messageViews[message.id] ?? "original" : "original";
                  const displayContent = message.role === "assistant" && viewMode === "translation" ? (message.translation ?? message.content) : message.content;

                  return (
                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] ${message.role === "user" ? "order-1" : ""}`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed ${message.role === "user" ? "rounded-tr-md bg-forest text-white" : "rounded-tl-md bg-mint text-ink"}`}>
                          {displayContent || (
                            <span className="inline-flex items-center gap-2 text-forest">
                              <Loader2 className="h-4 w-4 animate-spin" /> Javob yozilmoqda...
                            </span>
                          )}
                        </div>
                        {message.role === "assistant" && message.content ? (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <button onClick={() => speakText(message.content)} className="focus-ring rounded-md px-1.5 py-1 text-[11px] font-bold text-forest hover:bg-mint">
                              <Volume2 className="mr-1 inline h-3.5 w-3.5" /> Tinglash
                            </button>
                            <button onClick={() => void toggleMessageView(message.id, message.content)} className="focus-ring rounded-md px-1.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100">
                              {viewMode === "translation" ? "Asl matn" : "Tarjima"}
                            </button>
                            {message.correction ? <span className="text-[11px] font-semibold text-amber-700">Tuzatish mavjud ↓</span> : null}
                          </div>
                        ) : null}
                        {message.correction ? (
                          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-900">
                            <span className="font-extrabold">Yumshoq tuzatish:</span> {message.correction}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4 sm:p-5">
            {error ? (
              <p role="alert" className="mb-3 flex gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            ) : null}
            <form onSubmit={sendMessage} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="chat-input">Nemischa xabar</label>
              <textarea
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(undefined);
                  }
                }}
                placeholder="Nemischa xabar yozing..."
                rows={1}
                className="focus-ring max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium placeholder:text-slate-400"
              />
              <button
                disabled={!input.trim() || thinking}
                className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest text-white hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Yuborish"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] font-medium text-slate-400">Enter yuboradi · Shift + Enter yangi qator</p>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-3xl bg-forest p-5 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-forest"><Sparkles className="h-5 w-5" /></span>
            <h2 className="mt-4 text-lg font-black">Suhbat maslahati</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-white/75">Xato qilish tabiiy. Qisqa gaplar bilan boshlang va yangi so‘zlarni sinab ko‘ring.</p>
          </section>

          <section className="app-card p-5">
            <p className="eyebrow">boshlash uchun</p>
            <h2 className="mt-1 text-lg font-black text-ink">Mavzu tanlang</h2>
            <div className="mt-4 space-y-2">{starters.map((starter) => <button key={starter} onClick={() => void sendMessage(undefined, starter)} disabled={thinking} className="focus-ring w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-left text-xs font-bold leading-relaxed text-slate-600 hover:border-forest/20 hover:bg-mint hover:text-forest disabled:opacity-50">{starter}</button>)}</div>
          </section>

          <section className="app-card p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="eyebrow">Suhbatlar</p>
                <h2 className="mt-1 text-lg font-black text-ink">Chatlar</h2>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  Hozircha chatlar yo‘q. Yangi chat ochish uchun tepada joylashgan tugmani bosing.
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className={`flex items-center gap-2 rounded-xl border px-3 py-3 transition ${activeSessionId === session.id ? "border-forest bg-mint text-forest" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-forest/20 hover:bg-mint/70"}`}>
                    <button onClick={() => setActiveSessionId(session.id)} className="flex-1 text-left">
                      <div className="truncate text-sm font-semibold">{session.title}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{session.messages.length} xabar</div>
                    </button>
                    <button onClick={() => removeSession(session.id)} className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-white hover:text-rose-600" aria-label={`Delete ${session.title}`} title="Chatni o‘chirish">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-sm font-extrabold text-amber-900">🎯 Bugungi vazifa</p>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-amber-800">Kundalik hayotingiz haqida kamida 3 ta nemischa gap ayting.</p>
          </section>

          <section className="app-card p-5">
            <h3 className="eyebrow">Persona</h3>
            <p className="mt-2 text-sm text-slate-600">Suhbatning ohangini tanlang: odatiy o‘qituvchi yoki IELTS-uslubidagi Preppy yordamchisi.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setPersona("default")} className={`focus-ring flex-1 rounded-xl px-3 py-2 text-sm font-bold ${persona === "default" ? "bg-forest text-white" : "border border-slate-100 bg-white text-slate-700"}`}>Default</button>
              <button onClick={() => setPersona("preppy")} className={`focus-ring flex-1 rounded-xl px-3 py-2 text-sm font-bold ${persona === "preppy" ? "bg-forest text-white" : "border border-slate-100 bg-white text-slate-700"}`}>Preppy AI</button>
            </div>
          </section>
        </aside>
      </div>
      )}
    </AppShell>
  );
}