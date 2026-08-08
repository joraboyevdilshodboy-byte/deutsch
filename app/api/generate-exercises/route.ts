import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { callAI } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractJsonCandidate(rawText: string): string | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]?.trim()) {
    return fenced[1].trim();
  }

  const arrayMatch = trimmed.match(/\[\s*[\s\S]*\]/m);
  if (arrayMatch?.[0]) {
    return arrayMatch[0].trim();
  }

  return trimmed;
}

function parseExercisesPayload(rawText: string): any[] | null {
  const candidates = new Set<string>();
  if (rawText) candidates.add(rawText);

  const extracted = extractJsonCandidate(rawText);
  if (extracted) candidates.add(extracted);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray((parsed as any).exercises)) return (parsed as any).exercises;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

function buildMultipleChoiceOptions(answer: string) {
  const baseAnswer = answer.trim();
  const pool = [
    "der",
    "die",
    "das",
    "den",
    "dem",
    "ein",
    "eine",
    "einen",
    "einem",
    "einer",
    "kann",
    "kannst",
    "können",
    "könnt",
    "muss",
    "musst",
    "müssen",
    "müsst",
    "weil",
    "aber",
    "denn",
    "oder",
    "dass",
    "wenn",
  ];

  const initial = [baseAnswer, ...pool.filter((item) => item !== baseAnswer.toLowerCase() && item !== baseAnswer)];
  const unique = Array.from(new Set(initial.filter(Boolean).map((item) => String(item))));
  return unique.slice(0, 4);
}

function normalizeExerciseCandidate(ex: any) {
  const rawType = String(ex?.type ?? "multiple-choice").toLowerCase();
  const type = rawType.includes("fill") ? "fill-in-the-blank" : rawType.includes("translation") ? "translation" : "multiple-choice";
  const question = String(ex?.question ?? ex?.prompt ?? "").trim();
  const answer = String(ex?.answer ?? "").trim();
  const explanation = ex?.explanation ? String(ex.explanation).slice(0, 20000) : null;

  if (type === "multiple-choice") {
    const providedOptions = Array.isArray(ex?.options)
      ? ex.options.filter(Boolean).map((option: unknown) => String(option))
      : [];
    const options = Array.from(new Set([answer, ...providedOptions, ...buildMultipleChoiceOptions(answer)].filter(Boolean)));
    return {
      type,
      question,
      options: options.slice(0, 4),
      answer,
      explanation,
    };
  }

  return {
    type,
    question,
    options: [],
    answer,
    explanation,
  };
}

function makeLocalExercises(lvl: string, topic: string, n: number) {
  const templates = [
    {
      type: "fill-in-the-blank",
      examples: [
        { q: "Ich ___ (gehen) in die Schule.", a: "gehe", e: "Conjugate 'gehen' for ich in present tense." },
        { q: "Er ___ (sein) sehr freundlich.", a: "ist", e: "'sein' conjugation." },
        { q: "Wir ___ (haben) Zeit.", a: "haben", e: "'haben' conjugation for wir." },
        { q: "Du ___ (machen) deine Hausaufgaben.", a: "machst", e: "'machen' conjugation for du." },
        { q: "Sie ___ (kommen) morgen.", a: "kommt", e: "'kommen' conjugation for sie (singular)." },
        { q: "Ich ___ (kaufen) einen Apfel.", a: "kaufe", e: "Simple present tense." },
        { q: "Wir ___ (fahren) nach Berlin.", a: "fahren", e: "Verb conjugation for wir." },
        { q: "Er ___ (lesen) ein Buch.", a: "liest", e: "Irregular verb 'lesen'." },
        { q: "Du ___ (dürfen) hier nicht rauchen.", a: "darfst", e: "Modal verb usage." },
        { q: "Ich ___ (möchten) ein Glas Wasser.", a: "möchte", e: "Modal verb 'möchten'." },
      ],
    },
    {
      type: "multiple-choice",
      examples: [
        { q: "Welche Form passt? 'Wir ___ Fußball.'", options: ["spielst", "spielen", "spielt"], a: "spielen", e: "Correct verb form for 'wir' is 'spielen'." },
        { q: "Wähle das richtige Wort: 'Ich habe ___ Hunger.'", options: ["ein", "keinen", "einen"], a: "keinen", e: "Use 'keinen' with 'Hunger'." },
        { q: "Welche Präposition? 'Ich warte ___ dich.'", options: ["auf", "an", "für"], a: "auf", e: "Correct preposition is 'auf'." },
        { q: "Wähle das richtige Artikel: '___ Mann ist groß.'", options: ["Der", "Die", "Das"], a: "Der", e: "'Mann' is masculine." },
        { q: "Welches Wort passt? 'Sie ist sehr ___.'", options: ["schnell", "freundlich", "laufen"], a: "freundlich", e: "Adjective fits context." },
        { q: "Welches Wort passt? 'Das ist ___ Buch.'", options: ["mein", "meine", "meins"], a: "mein", e: "Possessive adjective for neuter noun." },
        { q: "Wähle die richtige Form: 'Er hat gestern ___.'", options: ["gelaufen", "läuft", "laufen"], a: "gelaufen", e: "Past participle for perfect tense." },
        { q: "Wähle das richtige Wort: 'Ich gehe ___ Haus.'", options: ["in das", "ins", "im"], a: "ins", e: "Contraction 'in das' -> 'ins'." },
        { q: "Welche Präposition? 'Wir sprechen ___ dem Lehrer.'", options: ["mit", "bei", "gegen"], a: "mit", e: "Use 'mit' to indicate 'with'." },
        { q: "Welches Wort? 'Er spricht ___ Englisch.'", options: ["kein", "keine", "keinen"], a: "kein", e: "Use 'kein' with uncountable noun." },
      ],
    },
    {
      type: "translation",
      examples: [
        { q: "Translate to German: 'I go to school.'", a: "Ich gehe zur Schule.", e: "Simple present translation." },
        { q: "Translate to German: 'He is friendly.'", a: "Er ist freundlich.", e: "Simple adjective use." },
        { q: "Translate to German: 'We are learning German every day.'", a: "Wir lernen jeden Tag Deutsch.", e: "Adverb placement." },
        { q: "Translate to German: 'I don't have time.'", a: "Ich habe keine Zeit.", e: "Negation with 'keine'." },
        { q: "Translate to German: 'Can you help me?'", a: "Können Sie mir helfen?", e: "Polite request." },
        { q: "Translate to German: 'She works in a bank.'", a: "Sie arbeitet in einer Bank.", e: "Prepositions and articles." },
        { q: "Translate to German: 'Tomorrow I will visit my friend.'", a: "Morgen werde ich meinen Freund besuchen.", e: "Future tense structure." },
        { q: "Translate to German: 'I like to read books.'", a: "Ich lese gern Bücher.", e: "Modal verb preference." },
        { q: "Translate to German: 'They have two children.'", a: "Sie haben zwei Kinder.", e: "Plural and numeral." },
        { q: "Translate to German: 'Where is the train station?'", a: "Wo ist der Bahnhof?", e: "Question word and article." },
      ],
    },
  ];

  const out: any[] = [];
  for (let i = 0; i < n; i++) {
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    const ex = tpl.examples[Math.floor(Math.random() * tpl.examples.length)];
    if (tpl.type === "multiple-choice") {
      out.push({
        id: `local-${Date.now()}-${i}`,
        type: tpl.type,
        question: ex.q,
        options: "options" in ex ? ex.options : [],
        answer: ex.a,
        explanation: ex.e,
      });
    } else {
      out.push({
        id: `local-${Date.now()}-${i}`,
        type: tpl.type,
        question: ex.q,
        options: [],
        answer: ex.a,
        explanation: ex.e,
      });
    }
  }

  return out;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Davom etish uchun tizimga kiring." }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch (err) {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const level = typeof payload.level === "string" ? payload.level : session.user.level ?? "A2";
  // Default to 20 exercises when not specified to give enough variety for practice.
  const count = Math.max(1, Math.min(Number(payload.count) || 20, 50));
  const area = typeof payload.area === "string" ? payload.area : "general vocabulary and grammar";
  const finishedAll = Boolean(payload.finishedAll);

  // If the user finished all current tests, ask Gemini to generate a new set
  // that does not repeat previous topics and optionally increases difficulty.
  const extraInstruction = finishedAll
    ? "The learner has completed all available tests; generate fresh exercises that avoid repeating the same exact prompts, include slightly different topics or increased difficulty, and vary exercise formats."
    : "";

  const systemInstruction = `You are an expert German teacher. Generate exactly ${count} distinct exercises for learners at level ${level}. Focus on: ${area}. ${extraInstruction} For each exercise provide an object with the following fields: id (short unique id), type (one of: multiple-choice, fill-in-the-blank, translation), question (German text), options (array of choices for multiple-choice, otherwise empty), answer (the correct answer), and explanation (a short, friendly explanation in German). Return the full result as a JSON array and nothing else.`;

  try {
    const { text } = await callAI("chat", {
      contents: [{ role: "user", content: "Bitte erstelle die Übungen in strukturierter JSON-Form." }],
      systemInstruction,
      maxOutputTokens: 1500,
      temperature: 0.6,
    });

    // Try to parse the model output as JSON. If parsing fails, use a small local fallback set.
    try {
      const parsed = parseExercisesPayload(text);
      const initialExercises = (parsed ?? makeLocalExercises(level, area, count)).map((item: any) => normalizeExerciseCandidate(item));

      // Normalize helper to compare questions and avoid duplicates.
      const normalize = (s: string) =>
        s
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .replace(/[^\w\säöüßẞáàäâéèëêíìïîóòöôúùüûñçğıİ]/g, "");

      const { prisma } = await import("@/lib/prisma");

      // Collect recent user questions to avoid repeating (last 10 sets).
      const recentSets = await prisma.exerciseSet.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { exercises: true },
      });

      const existingQuestions = new Set<string>();
      for (const s of recentSets) {
        for (const e of s.exercises) {
          if (e.question) existingQuestions.add(normalize(e.question));
        }
      }

      const requestedCount = count;
      const maxAttempts = 3;
      let attempts = 0;
      let finalExercises: any[] = [];

      // Start with initial parsed set, filter duplicates.
      const pushUnique = (arr: any[]) => {
        for (const ex of arr) {
          const q = String(ex.question ?? ex.prompt ?? "").slice(0, 20000);
          const key = normalize(q);
          if (!key || existingQuestions.has(key)) continue;
          // mark as used to avoid duplicates inside this batch
          existingQuestions.add(key);
          finalExercises.push({
            type: String(ex.type ?? "multiple-choice").slice(0, 100),
            question: q,
            options: ex.options ?? null,
            answer: String(ex.answer ?? "").slice(0, 20000),
            explanation: ex.explanation ? String(ex.explanation).slice(0, 20000) : null,
          });
          if (finalExercises.length >= requestedCount) break;
        }
      };

      pushUnique(initialExercises);

      if (finalExercises.length < requestedCount) {
        const fillerExercises = makeLocalExercises(level, area, requestedCount - finalExercises.length).map((item: any) => normalizeExerciseCandidate(item));
        pushUnique(fillerExercises);
      }

      // If we don't have enough unique exercises, ask Gemini again up to maxAttempts.
      while (finalExercises.length < requestedCount && attempts < maxAttempts) {
        attempts += 1;
        const need = requestedCount - finalExercises.length;
        // Provide examples of existing questions to avoid (limit to 10 shortest examples)
        const avoidExamples = Array.from(existingQuestions).slice(0, 10).map((q) => q.slice(0, 200));

        const extra = `Please generate ${need} additional distinct exercises (JSON array of exercise objects) that do NOT repeat the following example questions (do not include these exact questions): ${JSON.stringify(avoidExamples)}. Keep the same object shape as before.`;

        try {
          const { text: moreText } = await callAI("chat", {
            contents: [{ role: "user", content: extra }],
            systemInstruction,
            maxOutputTokens: 800,
            temperature: 0.65,
          });

          const moreParsed = parseExercisesPayload(moreText);
          if (Array.isArray(moreParsed)) {
            pushUnique(moreParsed);
          } else {
            // If Gemini didn't return valid JSON, stop retrying.
            break;
          }
        } catch (err) {
          console.warn("generate-exercises: failed to get replacement exercises", err);
          break;
        }
      }

      // If still not enough, proceed with what we have.
      // Save the generated set and items to the database for future reuse.
      const set = await prisma.exerciseSet.create({
        data: {
          userId: session.user.id,
          level,
          area,
          exercises: {
            create: finalExercises.map((ex) => ({
              type: ex.type,
              question: ex.question,
              options: ex.options ? JSON.stringify(ex.options) : null,
              answer: ex.answer,
              explanation: ex.explanation,
            })),
          },
        },
        include: { exercises: true },
      });

      return NextResponse.json({ exercises: finalExercises, savedSetId: set.id, savedCount: set.exercises.length });
    } catch (err) {
      console.warn("Generated exercises: failed to generate a structured response, using fallback exercises.", err);
      const fallbackExercises = makeLocalExercises(level, area, count);
      return NextResponse.json({ exercises: fallbackExercises });
    }
  } catch (error: any) {
    console.error("Exercise generation failed", error);
    // Fallback: create simple local exercises when AI providers fail.
    const makeLocalExercises = (lvl: string, topic: string, n: number) => {
      const templates = [
        {
          type: "fill-in-the-blank",
          examples: [
            { q: "Ich ___ (gehen) in die Schule.", a: "gehe", e: "Conjugate 'gehen' for ich in present tense." },
            { q: "Er ___ (sein) sehr freundlich.", a: "ist", e: "'sein' conjugation." },
            { q: "Wir ___ (haben) Zeit.", a: "haben", e: "'haben' conjugation for wir." },
            { q: "Du ___ (machen) deine Hausaufgaben.", a: "machst", e: "'machen' conjugation for du." },
            { q: "Sie ___ (kommen) morgen.", a: "kommt", e: "'kommen' conjugation for sie (singular)." },
            { q: "Ich ___ (kaufen) einen Apfel.", a: "kaufe", e: "Simple present tense." },
            { q: "Wir ___ (fahren) nach Berlin.", a: "fahren", e: "Verb conjugation for wir." },
            { q: "Er ___ (lesen) ein Buch.", a: "liest", e: "Irregular verb 'lesen'." },
            { q: "Du ___ (dürfen) hier nicht rauchen.", a: "darfst", e: "Modal verb usage." },
            { q: "Ich ___ (möchten) ein Glas Wasser.", a: "möchte", e: "Modal verb 'möchten'." },
          ],
        },
        {
          type: "multiple-choice",
          examples: [
            { q: "Welche Form passt? 'Wir ___ Fußball.'", options: ["spielst","spielen","spielt"], a: "spielen", e: "Correct verb form for 'wir' is 'spielen'." },
            { q: "Wähle das richtige Wort: 'Ich habe ___ Hunger.'", options: ["ein","keinen","einen"], a: "keinen", e: "Use 'keinen' with 'Hunger'." },
            { q: "Welche Präposition? 'Ich warte ___ dich.'", options: ["auf","an","für"], a: "auf", e: "Correct preposition is 'auf'." },
            { q: "Wähle das richtige Artikel: '___ Mann ist groß.'", options: ["Der","Die","Das"], a: "Der", e: "'Mann' is masculine." },
            { q: "Welches Wort passt? 'Sie ist sehr ___.'", options: ["schnell","freundlich","laufen"], a: "freundlich", e: "Adjective fits context." },
            { q: "Welches Wort passt? 'Das ist ___ Buch.'", options: ["mein","meine","meins"], a: "mein", e: "Possessive adjective for neuter noun." },
            { q: "Wähle die richtige Form: 'Er hat gestern ___.'", options: ["gelaufen","läuft","laufen"], a: "gelaufen", e: "Past participle for perfect tense." },
            { q: "Wähle das richtige Wort: 'Ich gehe ___ Haus.'", options: ["in das","ins","im"], a: "ins", e: "Contraction 'in das' -> 'ins'." },
            { q: "Welche Präposition? 'Wir sprechen ___ dem Lehrer.'", options: ["mit","bei","gegen"], a: "mit", e: "Use 'mit' to indicate 'with'." },
            { q: "Welches Wort? 'Er spricht ___ Englisch.'", options: ["kein","keine","keinen"], a: "kein", e: "Use 'kein' with uncountable noun." },
          ],
        },
        {
          type: "translation",
          examples: [
            { q: "Translate to German: 'I go to school.'", a: "Ich gehe zur Schule.", e: "Simple present translation." },
            { q: "Translate to German: 'He is friendly.'", a: "Er ist freundlich.", e: "Simple adjective use." },
            { q: "Translate to German: 'We are learning German every day.'", a: "Wir lernen jeden Tag Deutsch.", e: "Adverb placement." },
            { q: "Translate to German: 'I don't have time.'", a: "Ich habe keine Zeit.", e: "Negation with 'keine'." },
            { q: "Translate to German: 'Can you help me?'", a: "Können Sie mir helfen?", e: "Polite request." },
            { q: "Translate to German: 'She works in a bank.'", a: "Sie arbeitet in einer Bank.", e: "Prepositions and articles." },
            { q: "Translate to German: 'Tomorrow I will visit my friend.'", a: "Morgen werde ich meinen Freund besuchen.", e: "Future tense structure." },
            { q: "Translate to German: 'I like to read books.'", a: "Ich lese gern Bücher.", e: "Modal verb preference." },
            { q: "Translate to German: 'They have two children.'", a: "Sie haben zwei Kinder.", e: "Plural and numeral." },
            { q: "Translate to German: 'Where is the train station?'", a: "Wo ist der Bahnhof?", e: "Question word and article." },
          ],
        },
      ];

      const out: any[] = [];
      for (let i = 0; i < n; i++) {
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        const ex = tpl.examples[Math.floor(Math.random() * tpl.examples.length)];
        if (tpl.type === "multiple-choice") {
          out.push({
            id: `local-${Date.now()}-${i}`,
            type: tpl.type,
            question: ex.q,
            options: "options" in ex ? ex.options : [],
            answer: ex.a,
            explanation: ex.e,
          });
        } else {
          out.push({
            id: `local-${Date.now()}-${i}`,
            type: tpl.type,
            question: ex.q,
            options: [],
            answer: ex.a,
            explanation: ex.e,
          });
        }
      }
      return out;
    };

    try {
      const local = makeLocalExercises(level, area, count);
      const { prisma } = await import("@/lib/prisma");
      const set = await prisma.exerciseSet.create({
        data: {
          userId: session.user.id,
          level,
          area,
          exercises: { create: local.map((ex) => ({ type: ex.type, question: ex.question, options: ex.options.length ? JSON.stringify(ex.options) : null, answer: ex.answer, explanation: ex.explanation })) },
        },
        include: { exercises: true },
      });
      return NextResponse.json({ exercises: local, savedSetId: set.id, savedCount: set.exercises.length, fallback: true });
    } catch (saveErr) {
      console.error("Failed to save local exercises", saveErr);
      return NextResponse.json({ error: error?.message ?? "Mashqlarni yaratishda xatolik" }, { status: 500 });
    }
  }
}
