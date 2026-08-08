import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { callAI } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const topic = typeof payload.topic === "string" ? payload.topic : "daily life";
  const level = typeof payload.level === "string" ? payload.level : session?.user?.level ?? "A2";
  const minutes = Math.max(1, Math.min(Number(payload.minutes) || 2, 10));
  const requestedCount = Math.max(1, Math.min(Number(payload.count) || 3, 50));

  const systemInstruction = `You are an expert German content creator. Produce a short spoken audio script in German suitable for learners at level ${level}. Topic: ${topic}. Length: about ${minutes} minutes of speech. Provide a natural-sounding audio script and at the end output a JSON array of ${requestedCount} comprehension questions with fields: question (in German), choices (array), answer (index). Return exactly JSON for the questions and the transcript as plain text before it.`;

  // Local fallback generator when user is not authenticated or AI providers fail.
  const makeLocalListening = (t: string, lvl: string, mins: number) => {
    const simpleTranscripts = [
      `Guten Tag! Heute sprechen wir über ${t}. Ich erzähle dir eine kurze Geschichte und danach gibt es Fragen. ${t} ist ein interessantes Thema für Lernende. Wir beginnen jetzt mit einigen einfachen Sätzen. Erstens, viele Menschen reisen gerne. Zweitens, Reisen hilft, neue Kulturen zu entdecken. Drittens, man sollte immer seine Reisedokumente überprüfen. Ende der kurzen Erzählung.`,
      `Hallo! Das Thema heute ist ${t}. Ich werde langsam sprechen, damit du alles verstehen kannst. ${t} betrifft oft Alltagssituationen. Zum Beispiel: Wenn man reist, plant man die Route, bucht ein Hotel und probiert lokale Speisen. Jetzt beende ich die kurze Passage.`,
      `Heute sprechen wir über ${t}. Viele Leute finden ${t} spannend, weil es neue Erfahrungen bringt. Zum Beispiel, man lernt neue Wörter und trifft nette Menschen. Das war ein kurzer Text zum Thema ${t}.`,
    ];

    const transcript = simpleTranscripts[Math.floor(Math.random() * simpleTranscripts.length)];
    const questions = [
      { question: `Worum ging es im Text?`, choices: ["Über das Wetter", `Über ${t}`, "Über Sport"], answer: 1 },
      { question: `Was sollte man vor einer Reise tun?`, choices: ["Dokumente prüfen", "Nichts tun", "Den Fernseher reparieren"], answer: 0 },
      { question: `Warum ist ${t} interessant?`, choices: ["Weil es langweilig ist", "Weil es neue Erfahrungen bringt", "Weil es gefährlich ist"], answer: 1 },
    ];

    return { transcript, questions };
  };

  // Normalize AI questions into the Exercise shape expected by the client
  const normalizeQuestions = (qs: any[]) => {
    return qs.map((q, idx) => {
      const choices = q.choices ?? q.options ?? [];
      let answerValue: string = "";
      if (typeof q.answer === "number") answerValue = choices[q.answer] ?? "";
      else if (typeof q.answer === "string") answerValue = q.answer;
      else if (typeof q.correct === "string") answerValue = q.correct;

      return {
        id: q.id ?? `gen-list-${Date.now()}-${idx}`,
        prompt: q.question ?? q.prompt ?? String(q.text ?? q.q ?? ""),
        hint: q.hint ?? undefined,
        choices: Array.isArray(choices) ? choices.map(String) : [],
        answer: String(answerValue),
        explanation: q.explanation ?? q.explain ?? "",
      };
    }).filter((x) => x.prompt && x.choices && x.choices.length);
  };

  // If user is not authenticated, still return a local generated lesson so the UI doesn't stay with defaults.
  if (!session?.user?.id) {
    console.log("generate-listening: no session, returning local fallback");
    const local = makeLocalListening(topic, level, minutes);
    const normalizedLocal = normalizeQuestions(local.questions.map((q: any, i: number) => ({ question: q.question, choices: q.choices ?? q.options ?? [], answer: q.answer, explanation: q.explanation ?? "" })));
    return NextResponse.json({ transcript: local.transcript, questions: normalizedLocal, fallback: true });
  }

  try {
    const { text } = await callAI("chat", {
      contents: [{ role: "user", content: "Please produce the spoken script and the questions in the requested format." }],
      systemInstruction,
      maxOutputTokens: 1200,
      temperature: 0.7,
    });

    // Try to extract JSON questions from the model output
    const jsonMatch = text.match(/(\[\s*\{[\s\S]*\}\s*\])/m);
    let rawQuestions: any[] = [];
    if (jsonMatch) {
      try {
        rawQuestions = JSON.parse(jsonMatch[1]);
      } catch {
        rawQuestions = [];
      }
    }

    // Transcript is the text without the JSON questions
    const transcript = text.replace(/```/g, "").replace(/(\[\s*\{[\s\S]*\}\s*\])/m, "").trim();

    const questions = normalizeQuestions(rawQuestions);

    // If AI didn't produce questions or transcript, fall back to local generator.
    if (!transcript || questions.length === 0) {
      console.warn("generate-listening: AI returned empty transcript or no questions, using local fallback");
      const local = makeLocalListening(topic, level, minutes);
      const normalizedLocal = normalizeQuestions(local.questions.map((q: any, i: number) => ({ question: q.question, choices: q.choices ?? q.options ?? [], answer: q.answer, explanation: q.explanation ?? "" })));
      return NextResponse.json({ transcript: local.transcript, questions: normalizedLocal, fallback: true });
    }

    return NextResponse.json({ transcript, questions });
  } catch (error: any) {
    console.error("generate-listening failed, returning local fallback", error);
    const local = makeLocalListening(topic, level, minutes);
    const normalizedLocal = normalizeQuestions(local.questions.map((q: any, i: number) => ({ question: q.question, choices: q.choices ?? q.options ?? [], answer: q.answer, explanation: q.explanation ?? "" })));
    return NextResponse.json({ transcript: local.transcript, questions: normalizedLocal, fallback: true });
  }
}
