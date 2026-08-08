import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const topic = typeof payload.topic === "string" ? payload.topic : "general";
  const count = Math.max(5, Math.min(Number(payload.count) || 20, 200));
  const requestedLevel = typeof payload.level === "string" ? payload.level.toUpperCase() : "A1";
  const level = ["A1", "A2", "B1", "B2"].includes(requestedLevel) ? requestedLevel : "A1";
  const mode = typeof payload.mode === "string" ? payload.mode : "mixed";

  const levelPools: Record<string, Array<{ word: string; translation: string; example?: string }>> = {
    A1: [
      { word: "die Reise", translation: "safar", example: "Die Reise war sehr schön." },
      { word: "der Bahnhof", translation: "vokzal", example: "Der Bahnhof ist nicht weit." },
      { word: "das Hotel", translation: "mehmonxona", example: "Das Hotel ist in der Nähe." },
      { word: "der Flughafen", translation: "aeroport", example: "Am Flughafen warteten viele Menschen." },
      { word: "das Gepäck", translation: "yuk", example: "Ich habe mein Gepäck verloren." },
      { word: "reisen", translation: "sayohat qilish", example: "Wir reisen morgen nach Berlin." },
      { word: "der Zug", translation: "poyezd", example: "Der Zug kommt pünktlich." },
      { word: "der Ausweis", translation: "hujjat", example: "Zeigen Sie bitte Ihren Ausweis." },
      { word: "der Bus", translation: "avtobus", example: "Der Bus hält an der Ecke." },
      { word: "die Straße", translation: "ko‘cha", example: "Die Straße ist sehr lang." },
      { word: "das Ticket", translation: "chipta", example: "Ich kaufe ein Ticket." },
      { word: "die Stadt", translation: "shahar", example: "Die Stadt ist sehr schön." },
      { word: "das Wasser", translation: "suv", example: "Das Wasser ist kalt." },
      { word: "das Essen", translation: "ovqat", example: "Das Essen schmeckt gut." },
      { word: "die Schule", translation: "maktab", example: "Die Schule beginnt um acht Uhr." },
      { word: "der Freund", translation: "do‘st", example: "Mein Freund kommt aus meiner Stadt." },
      { word: "die Familie", translation: "oila", example: "Meine Familie ist groß." },
      { word: "gut", translation: "yaxshi", example: "Das ist gut." },
      { word: "klein", translation: "kichik", example: "Das Haus ist klein." },
      { word: "das Buch", translation: "kitob", example: "Ich lese ein Buch." },
    ],
    A2: [
      { word: "der Fahrplan", translation: "jadval", example: "Der Fahrplan hängt am Brett." },
      { word: "die Sehenswürdigkeit", translation: "diqqatga sazovor joy", example: "Die Stadt hat viele Sehenswürdigkeiten." },
      { word: "buchen", translation: "band qilish", example: "Ich buche ein Zimmer." },
      { word: "der Koffer", translation: "sumka", example: "Der Koffer ist schwer." },
      { word: "die Unterkunft", translation: "yashash joyi", example: "Die Unterkunft war gemütlich." },
      { word: "der Tourist", translation: "sayyoh", example: "Viele Touristen besichtigen die Altstadt." },
      { word: "die Reiseplanung", translation: "sayohat rejalari", example: "Die Reiseplanung dauert lange." },
      { word: "der Bahnsteig", translation: "platforma", example: "Der Bahnsteig ist Nummer drei." },
      { word: "das Gepäckband", translation: "baggaj lentasi", example: "Das Gepäckband dreht sich langsam." },
      { word: "die Führung", translation: "yurish", example: "Die Führung beginnt um zehn Uhr." },
      { word: "der Reiseführer", translation: "sayohat qo‘llanmasi", example: "Der Reiseführer zeigt den Weg." },
      { word: "der Ausflug", translation: "sayohat", example: "Wir machen einen Ausflug." },
      { word: "das Programm", translation: "dastur", example: "Das Programm ist bunt." },
      { word: "die Sehenswürdigkeit", translation: "diqqatga sazovor joy", example: "Die Sehenswürdigkeit ist weltberühmt." },
      { word: "die Haltestelle", translation: "to‘xtash joyi", example: "Die Haltestelle ist nahe dem Hotel." },
      { word: "der Passagier", translation: "yo‘lovchi", example: "Der Passagier wartet am Schiff." },
      { word: "die Abfahrt", translation: "jo‘nash", example: "Die Abfahrt ist um acht Uhr." },
      { word: "die Anmeldung", translation: "ro‘yxatdan o‘tish", example: "Die Anmeldung ist im Büro." },
      { word: "das Angebot", translation: "taklif", example: "Das Angebot ist günstig." },
      { word: "die Aussicht", translation: "manzara", example: "Die Aussicht ist wunderschön." },
    ],
    B1: [
      { word: "die Erfahrung", translation: "tajriba", example: "Sie hat viel Erfahrung." },
      { word: "die Möglichkeit", translation: "imkoniyat", example: "Das ist eine gute Möglichkeit." },
      { word: "die Verantwortung", translation: "mas'uliyat", example: "Er übernimmt die Verantwortung." },
      { word: "die Aufgabe", translation: "vazifa", example: "Die Aufgabe ist anspruchsvoll." },
      { word: "der Vorschlag", translation: "taklif", example: "Dein Vorschlag ist gut." },
      { word: "die Entscheidung", translation: "qaror", example: "Die Entscheidung war schwer." },
      { word: "die Diskussion", translation: "muhokama", example: "Die Diskussion war interessant." },
      { word: "die Zusammenarbeit", translation: "hamkorlik", example: "Die Zusammenarbeit funktionierte gut." },
      { word: "der Unterschied", translation: "farq", example: "Was ist der Unterschied?" },
      { word: "die Beziehung", translation: "munosabat", example: "Die Beziehung ist wichtig." },
      { word: "der Grund", translation: "sabab", example: "Der Grund ist klar." },
      { word: "das Ergebnis", translation: "natija", example: "Das Ergebnis war positiv." },
      { word: "die Gewohnheit", translation: "odat", example: "Deutschlernen ist meine neue Gewohnheit." },
      { word: "die Gelegenheit", translation: "imkoniyat", example: "Ich nutze die Gelegenheit." },
      { word: "die Anerkennung", translation: "e’tirof", example: "Er erhielt Anerkennung für seine Arbeit." },
      { word: "die Unterstützung", translation: "qo‘llab-quvvatlash", example: "Die Unterstützung hilft vielen Menschen." },
      { word: "das Verständnis", translation: "tushuncha", example: "Ich habe Verständnis für den Plan." },
      { word: "die Entwicklung", translation: "rivojlanish", example: "Die Entwicklung ist schnell." },
      { word: "die Herausforderung", translation: "qiyinchilik", example: "Die Herausforderung war groß." },
      { word: "der Hintergrund", translation: "fon", example: "Der Hintergrund des Berichts ist komplex." },
    ],
    B2: [
      { word: "die Verhandlung", translation: "muzokara", example: "Die Verhandlung dauerte mehrere Stunden." },
      { word: "das Fachwissen", translation: "mutaxassislik bilimlari", example: "Er hat viel Fachwissen in seinem Bereich." },
      { word: "der Sachverhalt", translation: "holat, vaziyat", example: "Der Sachverhalt war komplex und schwierig zu erklären." },
      { word: "die Abstimmung", translation: "kelishuv", example: "Die Abstimmung über den Plan war wichtig." },
      { word: "die Vernetzung", translation: "aloqa tarmog‘i", example: "Die Vernetzung der Systeme ist wichtig." },
      { word: "die Auswirkung", translation: "ta’sir", example: "Die Auswirkung auf das Projekt war groß." },
      { word: "die Überzeugung", translation: "ishonch", example: "Er spricht mit Überzeugung." },
      { word: "die Transparenz", translation: "oshkoralik", example: "Transparenz schafft Vertrauen." },
      { word: "die Nachhaltigkeit", translation: "barqarorlik", example: "Nachhaltigkeit ist ein zentrales Thema." },
      { word: "die Zustimmung", translation: "rozilik", example: "Die Zustimmung aller Beteiligten war wichtig." },
      { word: "das Konzept", translation: "kontseptsiya", example: "Das Konzept wurde ausführlich beschrieben." },
      { word: "die Analyse", translation: "tahlil", example: "Die Analyse zeigt verschiedene Optionen." },
      { word: "die Strategie", translation: "strategiya", example: "Die Strategie wurde neu überdacht." },
      { word: "die Umsetzung", translation: "amalga oshirish", example: "Die Umsetzung des Plans beginnt nächste Woche." },
      { word: "die Perspektive", translation: "nuqtai nazar", example: "Aus dieser Perspektive sieht es besser aus." },
      { word: "die Argumentation", translation: "dalil keltirish", example: "Die Argumentation war überzeugend." },
      { word: "die Voraussetzung", translation: "shart", example: "Die Voraussetzung für den Kurs ist Deutschkenntnisse." },
      { word: "die Priorität", translation: "ustuvorlik", example: "Die Priorität liegt auf Qualität." },
      { word: "die Kompetenz", translation: "malaka", example: "Er zeigt große Kompetenz in seinem Fach." },
      { word: "die Implementierung", translation: "amalga oshirish", example: "Die Implementierung begann im Sommer." },
    ],
  };

  // Ensure level pools do not contain words that appear in other levels.
  // Prefer strictly level-unique words; fall back to the original pool if that would be empty.
  const allLevels = Object.keys(levelPools);
  const originalPool = levelPools[level] ?? levelPools.A1;
  const uniquePool = originalPool.filter((it) => {
    for (const other of allLevels) {
      if (other === level) continue;
      const found = levelPools[other].some((o) => o.word === it.word);
      if (found) return false;
    }
    return true;
  });
  const pool = uniquePool.length ? uniquePool : originalPool;

  function sample(n: number) {
    const out: Array<{ word: string; translation: string; example?: string }> = [];
    const copy = [...pool];
    for (let i = 0; i < n && copy.length; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

  const items = sample(count);

  const flashcards = items.map((it, i) => ({ id: `f-${i}`, word: it.word, translation: it.translation, example: it.example, level }));
  const matching = items.slice(0, Math.min(items.length, 10)).map((it, i) => ({ id: `m-${i}`, left: it.word, right: it.translation, level }));
  const multiple = items.map((it, i) => {
    const distractors = sample(3).map((d) => d.translation).filter((t) => t !== it.translation).slice(0, 3);
    const choices = [it.translation, ...distractors].slice(0, 4);
    for (let j = choices.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [choices[j], choices[k]] = [choices[k], choices[j]];
    }
    return { id: `mc-${i}`, word: it.word, choices, answer: it.translation };
  });

  const gapfill = items.map((it, i) => ({ id: `g-${i}`, sentence: it.example ?? `Ich sehe ${it.word} am Morgen.`, gap: it.word }));

  const result: any = { topic, count, mode, items: {} };
  if (mode === "flashcards" || mode === "mixed") result.items.flashcards = flashcards;
  if (mode === "matching" || mode === "mixed") result.items.matching = matching;
  if (mode === "multiple-choice" || mode === "mixed") result.items.multiple = multiple.slice(0, count);
  if (mode === "gap-fill" || mode === "mixed") result.items.gapfill = gapfill.slice(0, count);

  return NextResponse.json(result);
}
