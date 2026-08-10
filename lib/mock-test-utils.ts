export type MockQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: 'A1' | 'A2' | 'B1';
  taskType?: string;
};

export type MockTestResult = {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, string>;
};

export type MockScoreSummary = {
  label: string;
  tone: 'success' | 'warning' | 'info';
};

export function buildMockQuestions(level: string): MockQuestion[] {
  const levelKey = level === 'B1' ? 'B1' : level === 'A2' ? 'A2' : 'A1';
  const pools: Record<string, MockQuestion[]> = {
    A1: [
      {
        id: 'a1-1',
        taskType: 'Lückentext',
        prompt: 'Kreuzen Sie die richtige Antwort an: Ich ___ jeden Morgen Deutsch.',
        options: ['lerne', 'lernst', 'lernt', 'lernen'],
        answer: 'lerne',
        explanation: 'Für das Subjekt “ich” wählt man die Form “lerne”.',
        difficulty: 'A1',
      },
      {
        id: 'a1-2',
        taskType: 'Wortwahl',
        prompt: 'Wählen Sie die passende Antwort: ___ du Kaffee?',
        options: ['Willst', 'Möchtest', 'Kannst', 'Magst'],
        answer: 'Möchtest',
        explanation: '“Möchtest” ist die höflichere Form im A1-Bereich.',
        difficulty: 'A1',
      },
      {
        id: 'a1-3',
        taskType: 'Lückentext',
        prompt: 'Setzen Sie das fehlende Wort ein: Ich komme ___ Hause.',
        options: ['zu', 'nach', 'aus', 'bei'],
        answer: 'nach',
        explanation: 'Im Deutschen sagt man “nach Hause”.',
        difficulty: 'A1',
      },
      {
        id: 'a1-4',
        taskType: 'Wortwahl',
        prompt: 'Wählen Sie die richtige Form: “Ich heiße Maria, ___ du?”',
        options: ['und', 'oder', 'aber', 'weil'],
        answer: 'und',
        explanation: '“und” verbindet die beiden Aussagen korrekt.',
        difficulty: 'A1',
      },
      {
        id: 'a1-5',
        taskType: 'Präposition',
        prompt: 'Setzen Sie das passende Wort ein: Das Buch ist ___ Tisch.',
        options: ['auf dem', 'unter dem', 'neben den', 'zwischen das'],
        answer: 'auf dem',
        explanation: 'Die richtige Präposition mit Dativ lautet “auf dem”.',
        difficulty: 'A1',
      },
      {
        id: 'a1-6',
        taskType: 'Verbalform',
        prompt: 'Wählen Sie die korrekte Form: “Wir ___ heute Abend ins Kino.”',
        options: ['gehen', 'geht', 'gehst', 'gehe'],
        answer: 'gehen',
        explanation: 'Mit “wir” verwendet man die Form “gehen”.',
        difficulty: 'A1',
      },
      {
        id: 'a1-7',
        taskType: 'Wortwahl',
        prompt: 'Kreuzen Sie die richtige Antwort an: “Ich habe ___ Hund.”',
        options: ['einen', 'eine', 'ein', 'meinen'],
        answer: 'einen',
        explanation: '“Hund” steht im Akkusativ, daher “einen”.',
        difficulty: 'A1',
      },
      {
        id: 'a1-8',
        taskType: 'Zusatztask',
        prompt: 'Wählen Sie das richtige Wort: “Das Fenster ist ___.”',
        options: ['offen', 'offener', 'öffnen', 'offenste'],
        answer: 'offen',
        explanation: 'Der Zustand wird mit “offen” beschrieben.',
        difficulty: 'A1',
      },
      {
        id: 'a1-9',
        taskType: 'Wortwahl',
        prompt: 'Wählen Sie die richtige Antwort: “Ich ___ drei Katzen.”',
        options: ['habe', 'hast', 'hat', 'haben'],
        answer: 'habe',
        explanation: 'Mit “ich” verwendet man die Form “habe”.',
        difficulty: 'A1',
      },
      {
        id: 'a1-10',
        taskType: 'Lückentext',
        prompt: 'Setzen Sie das passende Verb ein: Heute ___ ich in die Stadt.',
        options: ['gehe', 'geht', 'gehst', 'gehen'],
        answer: 'gehe',
        explanation: 'Bei “ich” lautet die richtige Verbform “gehe”.',
        difficulty: 'A1',
      },
    ],
    A2: [
      {
        id: 'a2-1',
        taskType: 'Präposition',
        prompt: 'Wählen Sie die richtige Präposition: Ich fahre morgen ___ Berlin.',
        options: ['nach', 'in', 'an', 'auf'],
        answer: 'nach',
        explanation: 'Für Städte und Länder verwendet man “nach”.',
        difficulty: 'A2',
      },
      {
        id: 'a2-2',
        taskType: 'Konjunktion',
        prompt: 'Setzen Sie das passende Wort ein: Ich bleibe zu Hause, ___ es regnet.',
        options: ['weil', 'obwohl', 'wenn', 'und'],
        answer: 'weil',
        explanation: '“weil” gibt den Grund an.',
        difficulty: 'A2',
      },
      {
        id: 'a2-3',
        taskType: 'Verbalform',
        prompt: 'Wählen Sie die richtige Form: “Sie ___ den Brief schon geschrieben.”',
        options: ['hat', 'habe', 'haben', 'habt'],
        answer: 'hat',
        explanation: '“Sie” im Singular benötigt “hat”.',
        difficulty: 'A2',
      },
      {
        id: 'a2-4',
        taskType: 'Präposition',
        prompt: 'Füllen Sie die Lücke: Er arbeitet ___ dem Projekt.',
        options: ['an', 'auf', 'in', 'für'],
        answer: 'an',
        explanation: '“an einem Projekt arbeiten” ist die richtige Konstruktion.',
        difficulty: 'A2',
      },
      {
        id: 'a2-5',
        taskType: 'Wortwahl',
        prompt: 'Wo passt das Wort? “Hast du ___ das Buch gelesen?”',
        options: ['schon', 'noch', 'nie', 'erst'],
        answer: 'schon',
        explanation: '“schon” bedeutet, dass etwas bereits passiert ist.',
        difficulty: 'A2',
      },
      {
        id: 'a2-6',
        taskType: 'Präposition',
        prompt: 'Setzen Sie das richtige Wort ein: Das Geschenk liegt ___ dem Tisch.',
        options: ['auf', 'über', 'zwischen', 'durch'],
        answer: 'auf',
        explanation: '“auf dem Tisch” ist die korrekte Ortsangabe.',
        difficulty: 'A2',
      },
      {
        id: 'a2-7',
        taskType: 'Modalverb',
        prompt: 'Wählen Sie die richtige Form: “Ich ___ morgen spät kommen.”',
        options: ['kann', 'muss', 'möchte', 'soll'],
        answer: 'kann',
        explanation: '“kann” zeigt eine Möglichkeit an.',
        difficulty: 'A2',
      },
      {
        id: 'a2-8',
        taskType: 'Komparativ',
        prompt: 'Kreuzen Sie die richtige Form an: Er ist ___ als sein Bruder.',
        options: ['größer', 'größere', 'am größten', 'größert'],
        answer: 'größer',
        explanation: 'Der Komparativ von “groß” ist “größer”.',
        difficulty: 'A2',
      },
      {
        id: 'a2-9',
        taskType: 'Präteritum',
        prompt: 'Wählen Sie die richtige Form: “Wir ___ den Film letzte Woche.”',
        options: ['sahen', 'sehen', 'gesehen', 'sieht'],
        answer: 'sahen',
        explanation: '“Letzte Woche” verlangt das Präteritum “sahen”.',
        difficulty: 'A2',
      },
      {
        id: 'a2-10',
        taskType: 'Präposition',
        prompt: 'Kreuzen Sie die richtige Präposition an: Sie wartet ___ den Bus.',
        options: ['auf', 'an', 'in', 'über'],
        answer: 'auf',
        explanation: '“warten auf” ist die korrekte Kombination.',
        difficulty: 'A2',
      },
    ],
    B1: [
      {
        id: 'b1-1',
        taskType: 'Verbalform',
        prompt: 'Kreuzen Sie die richtige Form an: Obwohl er müde war, ___ er weiter.',
        options: ['arbeitete', 'arbeitet', 'hat gearbeitet', 'wird arbeiten'],
        answer: 'arbeitete',
        explanation: 'Im Nebensatz wird die Präteritumform verwendet.',
        difficulty: 'B1',
      },
      {
        id: 'b1-2',
        taskType: 'Satzbau',
        prompt: 'Wählen Sie die richtige Ergänzung: Es ist wichtig, dass du ___.',
        options: ['pünktlich kommst', 'pünktlich kommen', 'pünktlich kamst', 'pünktlich gekommen'],
        answer: 'pünktlich kommst',
        explanation: 'Der Konjunktiv mit “dass” erfordert den Verbendstand.',
        difficulty: 'B1',
      },
      {
        id: 'b1-3',
        taskType: 'Infinitivgruppe',
        prompt: 'Wählen Sie die richtige Form: Sie hat beschlossen, ___.',
        options: ['nach Deutschland zu ziehen', 'nach Deutschland ziehen', 'nach Deutschland zieht', 'nach Deutschland gezogen'],
        answer: 'nach Deutschland zu ziehen',
        explanation: 'Nach “beschlossen” folgt eine Infinitivkonstruktion mit “zu”.',
        difficulty: 'B1',
      },
      {
        id: 'b1-4',
        taskType: 'Nominalisierung',
        prompt: 'Kreuzen Sie die richtige Antwort an: Die schnelle ___ des Verkehrs ist ein Thema.',
        options: ['Zunahme', 'zunahme', 'zunahmen', 'zunehmend'],
        answer: 'Zunahme',
        explanation: 'Nominalisierungen werden groß geschrieben.',
        difficulty: 'B1',
      },
      {
        id: 'b1-5',
        taskType: 'Präposition',
        prompt: 'Setzen Sie die richtige Präposition ein: Er interessiert sich ___ moderne Kunst.',
        options: ['für', 'an', 'bei', 'auf'],
        answer: 'für',
        explanation: '“sich interessieren für” ist die richtige Konstruktion.',
        difficulty: 'B1',
      },
      {
        id: 'b1-6',
        taskType: 'Konjunktiv II',
        prompt: 'Wählen Sie die passende Form: Wenn ich mehr Zeit hätte, ___ ich länger lernen.',
        options: ['würde', 'wäre', 'hätte', 'könnte'],
        answer: 'würde',
        explanation: 'Im Konjunktiv II mit einem Infinitiv braucht man “würde”.',
        difficulty: 'B1',
      },
      {
        id: 'b1-7',
        taskType: 'Relativsatz',
        prompt: 'Kreuzen Sie die richtige Ergänzung an: Das ist der Mann, ___ das Paket gebracht hat.',
        options: ['der', 'den', 'dem', 'dessen'],
        answer: 'der',
        explanation: 'Der Relativsatz bezieht sich auf das Subjekt “der Mann”.',
        difficulty: 'B1',
      },
      {
        id: 'b1-8',
        taskType: 'Wortwahl',
        prompt: 'Welche Variante passt? “Man darf hier nicht ___.”',
        options: ['parken', 'parkieren', 'geparkt', 'parkt'],
        answer: 'parken',
        explanation: 'Infinitiv nach “darf” ist korrekt.',
        difficulty: 'B1',
      },
      {
        id: 'b1-9',
        taskType: 'Passiv',
        prompt: 'Wählen Sie die richtige Form: “Der Text ___ morgen gelesen werden.”',
        options: ['muss', 'mussst', 'müssen', 'müsste'],
        answer: 'muss',
        explanation: 'Im Passiv mit “werden” benötigt man “muss”.',
        difficulty: 'B1',
      },
      {
        id: 'b1-10',
        taskType: 'Konjunktiv II',
        prompt: 'Kreuzen Sie die richtige Form an: Wenn er mehr Zeit hätte, ___ er den Kurs. ',
        options: ['würde besichtigen', 'wäre besichtigt', 'würde besichtigen', 'hätte besichtigt'],
        answer: 'würde besichtigen',
        explanation: 'Der Konjunktiv II mit Infinitiv verwendet “würde”.',
        difficulty: 'B1',
      },
    ],
  };

  return pools[levelKey].map((q) => ({ ...q }));
}

export function scoreMockTest(questions: Pick<MockQuestion, 'id' | 'answer'>[], answers: Record<string, string>) {
  const totalQuestions = questions.length;
  const correctCount = questions.reduce((count, question) => {
    const selected = answers[question.id];
    return count + (selected === question.answer ? 1 : 0);
  }, 0);

  return {
    correctCount,
    totalQuestions,
    percentage: totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100),
    answers,
  } as MockTestResult;
}

export function summarizeScore(percentage: number): MockScoreSummary {
  if (percentage >= 80) return { label: 'Ajoyib natija', tone: 'success' };
  if (percentage >= 50) return { label: 'Yaxshi natija', tone: 'info' };
  return { label: 'Yana bir oz mashq qiling', tone: 'warning' };
}
