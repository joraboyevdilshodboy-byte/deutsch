import type { UserLevel, VocabularyLevel } from "./user-level";

export type Exercise = {
  id: string;
  prompt: string;
  hint?: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type GrammarTopic = {
  slug: string;
  title: string;
  shortTitle: string;
  level: UserLevel;
  duration: string;
  description: string;
  overview: string;
  rule: string;
  examples: Array<{ german: string; translation: string }>;
  exercises: Exercise[];
  accent: "violet" | "cyan" | "amber" | "rose" | "emerald";
};

export function getGrammarTopicsForLevel(level: UserLevel) {
  return grammarTopics.filter((topic) => topic.level === level);
}

export const grammarTopics: GrammarTopic[] = [
  {
    slug: "artikel",
    title: "Artikellar: der, die, das",
    shortTitle: "Artikellar",
    level: "A1",
    duration: "12 daqiqa",
    description: "Otlarning jinsini tanish va to‘g‘ri artiklni ishlatish.",
    overview:
      "Nemis tilida har bir ot grammatik jinsga ega: erkak (der), ayol (die) yoki o‘rta jins (das). Artikllarni ot bilan birga yodlash eng yaxshi usuldir.",
    rule: "der = maskulin, die = feminin/plural, das = neutrum",
    examples: [
      { german: "der Tisch", translation: "stol" },
      { german: "die Lampe", translation: "chiroq" },
      { german: "das Buch", translation: "kitob" },
    ],
    exercises: [
      {
        id: "artikel-1",
        prompt: "___ Buch ist sehr interessant.",
        choices: ["Der", "Die", "Das", "Den"],
        answer: "Das",
        explanation: "Buch — o‘rta jinsdagi ot, shuning uchun das ishlatiladi.",
      },
      {
        id: "artikel-2",
        prompt: "Ich sehe ___ Frau im Park.",
        choices: ["der", "die", "das", "dem"],
        answer: "die",
        explanation: "Frau ayol jinsidagi ot. Bu yerda Akkusativda ham die o‘zgarmaydi.",
      },
      {
        id: "artikel-3",
        prompt: "___ Kinder spielen draußen.",
        choices: ["Der", "Die", "Das", "Dem"],
        answer: "Die",
        explanation: "Ko‘plikdagi barcha otlar die artiklini oladi.",
      },
    ],
    accent: "violet",
  },
  {
    slug: "pronomen",
    title: "Shaxs olmoshlari: ich, du, er",
    shortTitle: "Pronomen",
    level: "A1",
    duration: "10 daqiqa",
    description: "Shaxs olmoshlarini to‘g‘ri ishlatish va gapni oddiy shaklda tuzish.",
    overview:
      "Ich, du, er, sie, wir va ihr kabi shaxs olmoshlari gapning asosiy qismi bo‘lib, fe’l shaklini aniqlaydi.",
    rule: "Ich lerne, du lernst, er lernt, wir lernen",
    examples: [
      { german: "Ich komme aus Usbekistan.", translation: "Men O‘zbekistonlikman." },
      { german: "Du bist sehr freundlich.", translation: "Sen juda mehrmuhabbat ekansan." },
      { german: "Wir wohnen in Tashkent.", translation: "Biz Toshkentda yashaymiz." },
    ],
    exercises: [
      { id: "pronomen-1", prompt: "___ heiße Anna.", choices: ["Ich", "Du", "Er", "Wir"], answer: "Ich", explanation: "Gapni birinchi shaxs bilan boshlash uchun ich ishlatiladi." },
      { id: "pronomen-2", prompt: "___ kommst aus Deutschland.", choices: ["Ich", "Du", "Er", "Sie"], answer: "Du", explanation: "Qaratilgan shaxs du bo‘ladi." },
      { id: "pronomen-3", prompt: "___ sind sehr müde.", choices: ["Ich", "Wir", "Er", "Du"], answer: "Wir", explanation: "Ko‘plikdagi birinchi shaxs wir bilan ifodalanadi." },
    ],
    accent: "cyan",
  },
  {
    slug: "negation",
    title: "Inkor: nicht va kein",
    shortTitle: "Negation",
    level: "A1",
    duration: "11 daqiqa",
    description: "nicht va kein bilan inkor gaplarini shakllantirish.",
    overview:
      "nicht mavjudlikni yoki harakatni inkor qiladi, kein esa ot oldida ishlatiladi.",
    rule: "nicht + sifat/fe’l; kein + ot",
    examples: [
      { german: "Ich trinke keinen Kaffee.", translation: "Men qahva ichmayman." },
      { german: "Das ist nicht schwer.", translation: "Bu qiyin emas." },
      { german: "Er hat keine Zeit.", translation: "Uning vaqti yo‘q." },
    ],
    exercises: [
      { id: "negation-1", prompt: "Das ist ___ schwer.", choices: ["nicht", "kein", "keine", "keinen"], answer: "nicht", explanation: "Sifatni inkor qilish uchun nicht ishlatiladi." },
      { id: "negation-2", prompt: "Ich habe ___ Auto.", choices: ["nicht", "kein", "keine", "keinen"], answer: "kein", explanation: "Ot oldida kein ishlatiladi." },
      { id: "negation-3", prompt: "Sie spricht ___ Deutsch.", choices: ["nicht", "kein", "keine", "keinen"], answer: "nicht", explanation: "Fe’lni inkor qilish uchun nicht ishlatiladi." },
    ],
    accent: "emerald",
  },
  {
    slug: "praesens",
    title: "Fe’l tuslanishi: Präsens",
    shortTitle: "Präsens",
    level: "A1",
    duration: "15 daqiqa",
    description: "Hozirgi zamondagi muntazam va muhim fe’llarni tuslash.",
    overview:
      "Präsens hozirgi va yaqin kelajakdagi harakatlarni aytish uchun ishlatiladi. Fe’l qo‘shimchasi ega olmoshiga qarab o‘zgaradi.",
    rule: "ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en",
    examples: [
      { german: "Ich lerne Deutsch.", translation: "Men nemis tilini o‘rganaman." },
      { german: "Du wohnst in Berlin.", translation: "Sen Berlinda yashaysan." },
      { german: "Wir arbeiten heute.", translation: "Biz bugun ishlaymiz." },
    ],
    exercises: [
      {
        id: "praesens-1",
        prompt: "Er ___ jeden Tag Deutsch. (lernen)",
        choices: ["lerne", "lernst", "lernt", "lernen"],
        answer: "lernt",
        explanation: "er uchun fe’l oxiri -t bo‘ladi: er lernt.",
      },
      {
        id: "praesens-2",
        prompt: "Wir ___ gern Kaffee. (trinken)",
        choices: ["trinke", "trinkt", "trinken", "trinkst"],
        answer: "trinken",
        explanation: "wir bilan infinitivga o‘xshash -en shakli keladi.",
      },
      {
        id: "praesens-3",
        prompt: "Du ___ sehr schnell. (sprechen)",
        choices: ["spreche", "sprichst", "spricht", "sprechen"],
        answer: "sprichst",
        explanation: "sprechen kuchli fe’l: du shaklida e → i almashadi: du sprichst.",
      },
    ],
    accent: "cyan",
  },
  {
    slug: "perfekt",
    title: "O‘tgan zamon: Perfekt",
    shortTitle: "Perfekt",
    level: "A2",
    duration: "18 daqiqa",
    description: "Haben/sein va Partizip II bilan o‘tgan zamonni tuzish.",
    overview:
      "Perfekt kundalik nutqda o‘tgan voqealarni aytish uchun eng ko‘p ishlatiladi. U yordamchi fe’l va Partizip II dan tuziladi.",
    rule: "haben/sein + Partizip II; harakat va holat o‘zgarishlari ko‘pincha sein bilan",
    examples: [
      { german: "Ich habe einen Film gesehen.", translation: "Men film ko‘rdim." },
      { german: "Sie ist nach Hause gegangen.", translation: "U uyga ketdi." },
      { german: "Wir haben viel gelernt.", translation: "Biz ko‘p o‘rgandik." },
    ],
    exercises: [
      {
        id: "perfekt-1",
        prompt: "Ich ___ gestern nach Berlin gefahren.",
        choices: ["habe", "bin", "hat", "ist"],
        answer: "bin",
        explanation: "fahren harakatni bildiradi; manzilga borishda sein bilan keladi.",
      },
      {
        id: "perfekt-2",
        prompt: "Wir haben Pizza ___. (essen)",
        choices: ["geesst", "gegessen", "essen", "gegessent"],
        answer: "gegessen",
        explanation: "essen fe’lining Partizip II shakli gegessen.",
      },
      {
        id: "perfekt-3",
        prompt: "Meine Schwester ___ lange geschlafen.",
        choices: ["hat", "ist", "habe", "seid"],
        answer: "hat",
        explanation: "schlafen odatda haben bilan ishlatiladi.",
      },
    ],
    accent: "amber",
  },
  {
    slug: "praeteritum",
    title: "O‘tgan zamon: Präteritum",
    shortTitle: "Präteritum",
    level: "A2",
    duration: "16 daqiqa",
    description: "Hikoya va yozma nutqdagi sodda o‘tgan zamon.",
    overview:
      "Präteritum ko‘proq kitob, hikoya va yangiliklarda uchraydi. sein, haben va modal fe’llarning shakllari kundalik gapda ham tez ishlatiladi.",
    rule: "Muntazam fe’l: Stamm + -te; kuchli fe’llar ko‘pincha o‘zakni o‘zgartiradi.",
    examples: [
      { german: "Ich war gestern müde.", translation: "Men kecha charchagan edim." },
      { german: "Er hatte keine Zeit.", translation: "Uning vaqti yo‘q edi." },
      { german: "Wir spielten im Garten.", translation: "Biz bog‘da o‘ynadik." },
    ],
    exercises: [
      {
        id: "praeteritum-1",
        prompt: "Letztes Jahr ___ ich in Hamburg. (sein)",
        choices: ["bin", "war", "gewesen", "wäre"],
        answer: "war",
        explanation: "sein fe’lining ich shakli Präteritumda war bo‘ladi.",
      },
      {
        id: "praeteritum-2",
        prompt: "Sie ___ einen Brief. (schreiben)",
        choices: ["schreibt", "schrieb", "geschrieben", "schreibte"],
        answer: "schrieb",
        explanation: "schreiben kuchli fe’l; Präteritum: schrieb.",
      },
      {
        id: "praeteritum-3",
        prompt: "Wir ___ heute keine Schule. (haben)",
        choices: ["hatten", "haben", "hat", "gehabt"],
        answer: "hatten",
        explanation: "haben fe’lining wir shakli Präteritumda hatten.",
      },
    ],
    accent: "rose",
  },
  {
    slug: "akkusativ",
    title: "Kelishiklar: Akkusativ",
    shortTitle: "Akkusativ",
    level: "A1",
    duration: "14 daqiqa",
    description: "To‘g‘ridan-to‘g‘ri to‘ldiruvchi va artikl o‘zgarishi.",
    overview:
      "Akkusativ kimni? nimani? savollariga javob bo‘lgan to‘g‘ridan-to‘g‘ri to‘ldiruvchini bildiradi. Erkak jinsidagi artikl der → den bo‘ladi.",
    rule: "der → den; ein → einen. die va das ko‘pincha o‘zgarmaydi.",
    examples: [
      { german: "Ich sehe den Mann.", translation: "Men erkakni ko‘ryapman." },
      { german: "Sie kauft einen Apfel.", translation: "U olma sotib oladi." },
      { german: "Wir haben das Auto.", translation: "Bizda mashina bor." },
    ],
    exercises: [
      {
        id: "akkusativ-1",
        prompt: "Ich nehme ___ Bus.",
        choices: ["der", "den", "dem", "des"],
        answer: "den",
        explanation: "Bus maskulin va nehmen Akkusativ talab qiladi: den Bus.",
      },
      {
        id: "akkusativ-2",
        prompt: "Er besucht ___ Mutter.",
        choices: ["die", "der", "den", "dem"],
        answer: "die",
        explanation: "Mutter feminin; Akkusativda die shakli o‘zgarmaydi.",
      },
      {
        id: "akkusativ-3",
        prompt: "Wir kaufen ___ neuen Computer.",
        choices: ["ein", "einen", "einem", "einer"],
        answer: "einen",
        explanation: "Computer maskulin va Akkusativda: einen Computer.",
      },
    ],
    accent: "emerald",
  },
  {
    slug: "dativ",
    title: "Kelishiklar: Dativ",
    shortTitle: "Dativ",
    level: "A2",
    duration: "17 daqiqa",
    description: "Bilvosita to‘ldiruvchi va Dativ predloglari.",
    overview:
      "Dativ kimga? nimaga? savollariga javob beradi. Ba’zi fe’llar va predloglar doim Dativni talab qiladi.",
    rule: "der → dem, die → der, das → dem, plural → den (+n ko‘pincha)",
    examples: [
      { german: "Ich helfe dem Mann.", translation: "Men erkakka yordam beraman." },
      { german: "Sie gibt der Frau ein Buch.", translation: "U ayolga kitob beradi." },
      { german: "Wir fahren mit dem Zug.", translation: "Biz poyezdda ketamiz." },
    ],
    exercises: [
      {
        id: "dativ-1",
        prompt: "Ich danke ___ Lehrerin.",
        choices: ["die", "der", "den", "dem"],
        answer: "der",
        explanation: "danken doim Dativni talab qiladi; die Lehrerin → der Lehrerin.",
      },
      {
        id: "dativ-2",
        prompt: "Er fährt mit ___ Auto zur Arbeit.",
        choices: ["das", "dem", "den", "des"],
        answer: "dem",
        explanation: "mit predlogi Dativ talab qiladi: mit dem Auto.",
      },
      {
        id: "dativ-3",
        prompt: "Wir sprechen mit ___ Freunden.",
        choices: ["die", "der", "den", "dem"],
        answer: "den",
        explanation: "Ko‘plikda Dativ: den Freunden.",
      },
    ],
    accent: "cyan",
  },
  {
    slug: "genitiv",
    title: "Kelishiklar: Genitiv",
    shortTitle: "Genitiv",
    level: "B1",
    duration: "14 daqiqa",
    description: "Egalik va rasmiy uslubdagi Genitiv shakllari.",
    overview:
      "Genitiv kimning? nimaning? ma’nosini beradi. Kundalik nutqda ko‘pincha von + Dativ bilan almashtiriladi, biroq yozma nutqda muhim.",
    rule: "der → des, die → der, das → des; maskulin/neutrum otiga ko‘pincha -(e)s qo‘shiladi.",
    examples: [
      { german: "Das ist das Auto des Lehrers.", translation: "Bu o‘qituvchining mashinasi." },
      { german: "Die Farbe der Tasche ist schön.", translation: "Sumkaning rangi chiroyli." },
      { german: "Wegen des Wetters bleiben wir zu Hause.", translation: "Ob-havo sabab uyda qolamiz." },
    ],
    exercises: [
      {
        id: "genitiv-1",
        prompt: "Das ist der Name ___ Kindes.",
        choices: ["das", "dem", "des", "den"],
        answer: "des",
        explanation: "Kind neutrum; Genitivda des Kindes bo‘ladi.",
      },
      {
        id: "genitiv-2",
        prompt: "Die Meinung ___ Frau ist wichtig.",
        choices: ["der", "die", "dem", "den"],
        answer: "der",
        explanation: "Frau feminin; Genitivda der Frau.",
      },
      {
        id: "genitiv-3",
        prompt: "Wegen ___ Regens bleiben wir hier.",
        choices: ["dem", "den", "des", "der"],
        answer: "des",
        explanation: "wegen odatda Genitiv bilan ishlatiladi: wegen des Regens.",
      },
    ],
    accent: "rose",
  },
  {
    slug: "trennbare-verben",
    title: "Ajraladigan fe’llar",
    shortTitle: "Trennbare Verben",
    level: "A2",
    duration: "15 daqiqa",
    description: "anfangen, aufstehen, einkaufen kabi fe’llar bilan gap tuzish.",
    overview:
      "Ba’zi fe’llarda prefiks gapning boshiga yoki oxiriga chiqib, ma’noni o‘zgartiradi. Bu fe’llar kundalik nutqda tez-tez uchraydi.",
    rule: "Prefiks gapda ajraladi: aufstehen, anrufen, einladen",
    examples: [
      { german: "Ich stehe um 7 Uhr auf.", translation: "Men 7 da turaman." },
      { german: "Wir kaufen heute ein.", translation: "Biz bugun xarid qilamiz." },
      { german: "Er ruft mich an.", translation: "U meni qo‘ng‘iroq qiladi." },
    ],
    exercises: [
      { id: "trennbare-1", prompt: "Ich ___ um 6 Uhr. (aufstehen)", choices: ["stehe auf", "aufstehe", "steht auf", "aufstehen"], answer: "stehe auf", explanation: "aufstehen ajraladigan fe’l; fe’l oxirida bo‘ladi." },
      { id: "trennbare-2", prompt: "Wir ___ heute Abend ein. (einkaufen)", choices: ["kaufen ein", "einkaufen", "einkauft", "kaufen"], answer: "kaufen ein", explanation: "einkaufen ajraladigan fe’l va gap oxirida keladi." },
      { id: "trennbare-3", prompt: "Er ___ mich morgen an. (anrufen)", choices: ["ruft an", "ruft an", "ruft mich an", "anruft"], answer: "ruft an", explanation: "anrufen fe’li an bilan ajraladi." },
    ],
    accent: "amber",
  },
  {
    slug: "konnektoren",
    title: "Bog‘lovchilar",
    shortTitle: "Bog‘lovchilar",
    level: "A2",
    duration: "16 daqiqa",
    description: "weil, dass, aber, denn va boshqa bog‘lovchilar.",
    overview:
      "Bog‘lovchilar ikki fikrni birlashtiradi. aber va denn dan keyin odatiy so‘z tartibi saqlanadi, weil va dass esa fe’lni oxirga olib boradi.",
    rule: "weil/dass + ... + fe’l oxirida; aber/denn + odatiy V2 so‘z tartibi",
    examples: [
      { german: "Ich lerne, weil ich die Prüfung bestehe möchte.", translation: "Men o‘qiyman, chunki imtihondan o‘tmoqchiman." },
      { german: "Ich weiß, dass du heute kommst.", translation: "Men bugun kelishingni bilaman." },
      { german: "Er ist müde, aber er arbeitet.", translation: "U charchagan, ammo ishlaydi." },
    ],
    exercises: [
      {
        id: "konnektoren-1",
        prompt: "Ich bleibe zu Hause, ___ ich krank bin.",
        choices: ["aber", "weil", "denn", "oder"],
        answer: "weil",
        explanation: "Sababni bildirish uchun weil ishlatiladi.",
      },
      {
        id: "konnektoren-2",
        prompt: "Ich weiß, dass er morgen ___.",
        choices: ["kommt", "komme", "kommen", "gekommen"],
        answer: "kommt",
        explanation: "dass ergash gapida tuslangan fe’l oxirida keladi.",
      },
      {
        id: "konnektoren-3",
        prompt: "Sie hat Zeit, ___ sie kommt nicht.",
        choices: ["weil", "dass", "aber", "wenn"],
        answer: "aber",
        explanation: "Qarama-qarshilikni aber bildiradi.",
      },
    ],
    accent: "amber",
  },
  {
    slug: "wortstellung",
    title: "So‘z tartibi",
    shortTitle: "So‘z tartibi",
    level: "A2",
    duration: "19 daqiqa",
    description: "Asosiy gap, savol va vaqt-joy tartibi.",
    overview:
      "Nemischa asosiy gapda tuslangan fe’l odatda ikkinchi o‘rinda turadi. Gap vaqt yoki joy bilan boshlansa ham fe’l ikkinchi o‘rinni saqlaydi.",
    rule: "Asosiy gap: [1-o‘rin] + tuslangan fe’l + ega + qolgan qism",
    examples: [
      { german: "Heute lerne ich Deutsch.", translation: "Bugun men nemis tilini o‘rganaman." },
      { german: "Am Abend geht sie ins Kino.", translation: "Kechqurun u kinoga boradi." },
      { german: "Wann kommst du nach Hause?", translation: "Qachon uyga kelasiz?" },
    ],
    exercises: [
      {
        id: "wortstellung-1",
        prompt: "Heute ___ ich meine Freunde.",
        choices: ["treffe", "ich treffe", "treffen", "trifft"],
        answer: "treffe",
        explanation: "Heute birinchi o‘rinda, tuslangan fe’l esa ikkinchi o‘rinda: Heute treffe ich ...",
      },
      {
        id: "wortstellung-2",
        prompt: "Morgen ___ wir nach Köln.",
        choices: ["fahren", "fährt", "fahren wir", "wir fahren"],
        answer: "fahren",
        explanation: "Morgen + fahren + wir: fe’l ikkinchi o‘rinda.",
      },
      {
        id: "wortstellung-3",
        prompt: "Ich glaube, dass er heute nicht ___.",
        choices: ["kommt", "kommt er", "er kommt", "kommen"],
        answer: "kommt",
        explanation: "dass ergash gapida fe’l oxiriga boradi.",
      },
    ],
    accent: "violet",
  },
  {
    slug: "adjektivendungen",
    title: "Sifat tugallanishlari",
    shortTitle: "Adjektivendungen",
    level: "B1",
    duration: "16 daqiqa",
    description: "Sifatlarni aniqlovchi artikl va holatlarga qarab o‘zgarishini tushunish.",
    overview:
      "B1 darajasida sifatlar ko‘pincha artikl va kelishik bilan birga keladi. Ular turli shakllarga ega bo‘ladi.",
    rule: "ein guter Freund, eine gute Idee, ein gutes Buch",
    examples: [
      { german: "ein guter Freund", translation: "yaxshi do‘st" },
      { german: "eine schöne Stadt", translation: "chiroyli shahar" },
      { german: "ein interessantes Buch", translation: "qiziqarli kitob" },
    ],
    exercises: [
      { id: "adj-1", prompt: "Das ist ___ ___ Idee. (gut)", choices: ["eine gute", "ein guter", "ein gutes", "eine gut"], answer: "eine gute", explanation: "Idee feminin; gute shakli ishlatiladi." },
      { id: "adj-2", prompt: "Er hat ___ ___ Auto. (neu)", choices: ["ein neues", "eine neue", "einen neuen", "ein neu"], answer: "ein neues", explanation: "Auto neutrum; neues shakli kerak." },
      { id: "adj-3", prompt: "Sie spricht mit ___ ___ Mann. (freundlich)", choices: ["einem freundlichen", "einer freundlichen", "ein freundlicher", "einem freundlich"], answer: "einem freundlichen", explanation: "Dativda freundlichen shakli kerak." },
    ],
    accent: "rose",
  },
  {
    slug: "konjunktiv",
    title: "Konjunktiv II: istalgan holat",
    shortTitle: "Konjunktiv II",
    level: "B1",
    duration: "17 daqiqa",
    description: "Tilshunoslik, taklif va xohishlarni yengilroq ifodalash.",
    overview:
      "Konjunktiv II ko‘pincha istak, taxmin, taklif yoki shartni bildirish uchun ishlatiladi.",
    rule: "würde + infinitiv; wäre, hätte",
    examples: [
      { german: "Ich würde gern reisen.", translation: "Men sayohat qilishni xohlar edim." },
      { german: "Wenn ich Zeit hätte, würde ich lernen.", translation: "Agar vaqtim bo‘lsa, o‘rganar edim." },
      { german: "Das wäre schön.", translation: "Bu chiroyli bo‘lardi." },
    ],
    exercises: [
      { id: "konjunktiv-1", prompt: "Ich ___ gern mehr Deutsch lernen.", choices: ["würde", "werde", "werde würde", "würde würde"], answer: "würde", explanation: "Istakni ifodalash uchun würde ishlatiladi." },
      { id: "konjunktiv-2", prompt: "Wenn ich Zeit ___, würde ich kommen.", choices: ["hat", "hätte", "habe", "hatte"], answer: "hätte", explanation: "Konjunktiv II uchun hätte shakli ishlatiladi." },
      { id: "konjunktiv-3", prompt: "Das ___ fantastisch.", choices: ["wäre", "ist", "war", "sein"], answer: "wäre", explanation: "Konjunktiv II bilan wäre ishlatiladi." },
    ],
    accent: "violet",
  },
  {
    slug: "passiv",
    title: "Passiv tuzilishi",
    shortTitle: "Passiv",
    level: "B2",
    duration: "18 daqiqa",
    description: "Passiv gaplarni qurish va faol/majhul munosabatlarni ajratish.",
    overview:
      "Odatda kim amalni bajarayotganini ko‘rsatmaydigan gaplar uchun Passiv ishlatiladi. Nemis tilida passiv bo‘lib, werden + Partizip II yoki sein + Partizip II shaklida ifodalanadi.",
    rule: "Aktiv: Subjekt + Prädikat. Passiv: werden + Partizip II; sein + Partizip II for Zustandspassiv.",
    examples: [
      { german: "Das Buch wird von dem Schüler gelesen.", translation: "Kitob talaba tomonidan o‘qiladi." },
      { german: "Die Aufgaben sind erledigt.", translation: "Topshiriqlar bajarilgan." },
      { german: "Der Brief wurde gestern geschrieben.", translation: "Xat kecha yozildi." },
    ],
    exercises: [
      {
        id: "passiv-1",
        prompt: "Der Kuchen ___ von der Mutter gebacken.",
        choices: ["wird", "ist", "wurde", "war"],
        answer: "wird",
        explanation: "Zamonaviy Passivda werden + Partizip II ishlatiladi: wird gebacken.",
      },
      {
        id: "passiv-2",
        prompt: "Das Fenster ___ gestern repariert.",
        choices: ["wurde", "wird", "ist", "war"],
        answer: "wurde",
        explanation: "O‘tgan zamon Passivi uchun wurde + Partizip II kerak.",
      },
      {
        id: "passiv-3",
        prompt: "Die Ergebnisse ___ bald bekanntgegeben.",
        choices: ["werden", "wird", "sind", "wurde"],
        answer: "werden",
        explanation: "Kelajakdagi Passivda werden ishlatiladi: werden bekanntgegeben.",
      },
    ],
    accent: "emerald",
  },
  {
    slug: "indirekte-rede",
    title: "Bilvosita nutq: Konjunktiv I",
    shortTitle: "Indirekte Rede",
    level: "B2",
    duration: "17 daqiqa",
    description: "Bilvosita nutqda Konjunktiv I yordamida boshqasining gapini qayta aytish.",
    overview:
      "Bilvosita nutqda gapni kim aytganini va nima deyilganini ko‘rsatish muhim. Nemis tilida bu ko‘pincha Konjunktiv I yordamida ifodalanadi: er habe gesagt, sie sei müde.",
    rule: "Er sagt, er sei müde. / Sie meint, er könne kommen. Konjunktiv I odatda -e, -est, -e, -en, -et, -en qo‘shimchalari bilan ishlatiladi.",
    examples: [
      { german: "Er sagt, er habe keine Zeit.", translation: "U dedi, uning vaqti yo‘q." },
      { german: "Sie meinte, er könne kommen.", translation: "U aytdiki, u kelishi mumkin." },
      { german: "Der Lehrer sagte, die Prüfung sei schwer.", translation: "O‘qituvchi imtihon qiyinligini aytdi." },
    ],
    exercises: [
      {
        id: "indirekte-rede-1",
        prompt: "Er sagt, er ___ heute nicht kommen.",
        choices: ["könne", "kann", "könnte", "kommt"],
        answer: "könne",
        explanation: "Konjunktiv I uchun er könne ishlatiladi.",
      },
      {
        id: "indirekte-rede-2",
        prompt: "Sie meint, sie ___ die E-Mail schon geschrieben haben.",
        choices: ["habe", "hat", "hätte", "haben"],
        answer: "habe",
        explanation: "Konjunktiv I uchun sie habe ishlatiladi.",
      },
      {
        id: "indirekte-rede-3",
        prompt: "Der Reporter sagt, die Verhandlung ___ schwierig gewesen sein.",
        choices: ["sei", "ist", "war", "wäre"],
        answer: "sei",
        explanation: "Bilvosita nutqda Konjunktiv I uchun sei ishlatiladi.",
      },
    ],
    accent: "rose",
  },
  {
    slug: "modalverben",
    title: "Modal fe’llar",
    shortTitle: "Modal fe’llar",
    level: "A1",
    duration: "15 daqiqa",
    description: "können, müssen, wollen, dürfen, sollen va mögen.",
    overview:
      "Modal fe’llar imkoniyat, majburiyat, istak va ruxsatni bildiradi. Asosiy fe’l infinitiv shaklda gap oxiriga boradi.",
    rule: "Ega + modal fe’l + ... + asosiy fe’l (infinitiv) oxirida",
    examples: [
      { german: "Ich kann gut schwimmen.", translation: "Men yaxshi suza olaman." },
      { german: "Du musst heute arbeiten.", translation: "Sen bugun ishlashing kerak." },
      { german: "Dürfen wir hier parken?", translation: "Bu yerda mashina qo‘ya olamizmi?" },
    ],
    exercises: [
      {
        id: "modal-1",
        prompt: "Ich ___ heute länger arbeiten.",
        choices: ["kann", "können", "kannst", "könnt"],
        answer: "kann",
        explanation: "ich bilan können → kann.",
      },
      {
        id: "modal-2",
        prompt: "Wir müssen morgen früh ___.",
        choices: ["aufstehen", "aufgestanden", "stehen auf", "aufsteht"],
        answer: "aufstehen",
        explanation: "Modal fe’ldan keyin asosiy fe’l infinitivda gap oxirida bo‘ladi.",
      },
      {
        id: "modal-3",
        prompt: "___ du mir helfen?",
        choices: ["Kann", "Kannst", "Können", "Könnt"],
        answer: "Kannst",
        explanation: "du bilan können → kannst; so‘roq gapda fe’l boshida turadi.",
      },
    ],
    accent: "emerald",
  },
];

export type ListeningLesson = {
  title: string;
  level: UserLevel;
  duration: string;
  transcript: string;
  questions: Exercise[];
};

export const listeningLessons: ListeningLesson[] = [
  {
    title: "Mening haftalik kunim",
    level: "A1",
    duration: "1:20",
    transcript:
      "Hallo, ich heiße Sara. Ich wohne in Tashkent. Jeden Morgen stehe ich um sieben Uhr auf. Dann frühstücke ich und gehe zur Schule. Am Abend lerne ich Deutsch und sehe oft ein kleines Video.",
    questions: [
      {
        id: "listen-a1-1",
        prompt: "Wo wohnt Sara?",
        choices: ["In Tashkent", "In Berlin", "In Paris", "In London"],
        answer: "In Tashkent",
        explanation: "Sara sagt, dass sie in Tashkent wohnt.",
      },
      {
        id: "listen-a1-2",
        prompt: "Wann steht Sara auf?",
        choices: ["Um sieben Uhr", "Um acht Uhr", "Um neun Uhr", "Um sechs Uhr"],
        answer: "Um sieben Uhr",
        explanation: "Der Text sagt: „um sieben Uhr“.",
      },
      {
        id: "listen-a1-3",
        prompt: "Was macht Sara am Abend?",
        choices: ["Sie lernt Deutsch", "Sie arbeitet", "Sie schläft", "Sie kauft Brot"],
        answer: "Sie lernt Deutsch",
        explanation: "Am Abend lernt sie Deutsch.",
      },
    ],
  },
  {
    title: "Lena dam olish kunlari haqida",
    level: "A2",
    duration: "2:10",
    transcript:
      "Hallo, ich heiße Lena. Am Samstag bin ich früh aufgestanden, weil ich mit meiner Freundin Anna in die Stadt fahren wollte. Zuerst haben wir in einem kleinen Café gefrühstückt. Danach sind wir durch die Altstadt spaziert und haben Fotos gemacht. Am Nachmittag hat es plötzlich geregnet. Deshalb sind wir in ein Museum gegangen. Dort gab es eine interessante Ausstellung über Berlin. Am Abend war ich müde, aber sehr glücklich. Ich möchte das nächste Wochenende wieder so verbringen.",
    questions: [
      {
        id: "listen-1",
        prompt: "Lena ist am Samstag mit wem in die Stadt gefahren?",
        choices: ["Mit ihrer Schwester", "Mit Anna", "Allein", "Mit ihrer Mutter"],
        answer: "Mit Anna",
        explanation: "Lena sagt: „mit meiner Freundin Anna“.",
      },
      {
        id: "listen-2",
        prompt: "Was haben Lena und Anna nach dem Frühstück gemacht?",
        choices: ["Sie sind nach Hause gegangen", "Sie haben gearbeitet", "Sie sind durch die Altstadt spaziert", "Sie haben einen Film gesehen"],
        answer: "Sie sind durch die Altstadt spaziert",
        explanation: "Nach dem Frühstück sind sie durch die Altstadt spaziert.",
      },
      {
        id: "listen-3",
        prompt: "Warum sind sie in ein Museum gegangen?",
        choices: ["Weil es geregnet hat", "Weil das Café geschlossen war", "Weil Anna arbeiten musste", "Weil sie ein Konzert sehen wollten"],
        answer: "Weil es geregnet hat",
        explanation: "Am Nachmittag hat es plötzlich geregnet.",
      },
    ],
  },
  {
    title: "Tren kechikishi haqida hisobot",
    level: "B1",
    duration: "2:45",
    transcript:
      "Guten Morgen. Heute möchte ich über einen ungewöhnlichen Tag berichten. Ich musste früh aus dem Haus gehen, weil mein Zug sehr spät ankam. Während der Wartezeit habe ich mit anderen Fahrgästen über die Verspätung gesprochen. Es war ärgerlich, aber am Ende war die Situation auch ein guter Grund, neue Leute kennenzulernen.",
    questions: [
      {
        id: "listen-b1-1",
        prompt: "Warum musste der Sprecher früh aus dem Haus gehen?",
        choices: ["Weil er arbeiten musste", "Weil der Zug spät ankam", "Weil es kalt war", "Weil er einen Termin verpasst hat"],
        answer: "Weil der Zug spät ankam",
        explanation: "Der Text sagt, dass der Zug sehr spät ankam.",
      },
      {
        id: "listen-b1-2",
        prompt: "Was hat der Sprecher während der Wartezeit gemacht?",
        choices: ["Er hat geschlafen", "Er hat mit Fahrgästen gesprochen", "Er hat im Café gefrühstückt", "Er ist nach Hause gegangen"],
        answer: "Er hat mit Fahrgästen gesprochen",
        explanation: "Während der Wartezeit sprach er mit anderen Fahrgästen.",
      },
      {
        id: "listen-b1-3",
        prompt: "Wie war die Situation am Ende?",
        choices: ["Sehr langweilig", "Sehr stressig und schlecht", "Auch ein Grund, neue Leute kennenzulernen", "Unmöglich"],
        answer: "Auch ein Grund, neue Leute kennenzulernen",
        explanation: "Am Ende war die Situation auch ein guter Grund, neue Leute kennenzulernen.",
      },
    ],
  },
  {
    title: "Entscheidung für die Zukunft",
    level: "B2",
    duration: "3:10",
    transcript:
      "Im vergangenen Jahr stand ich vor einer schwierigen Entscheidung: Sollte ich das Angebot annehmen, im Ausland zu arbeiten, oder in meiner Heimat zu bleiben? Nach langer Überlegung habe ich mich für die Auslandserfahrung entschieden. Die neue Position verlangt viel Verantwortung, aber sie eröffnet auch neue Chancen. Ich bespreche meine Beweggründe mit Kolleginnen und Kollegen und ziehe dabei verschiedene Perspektiven in Betracht.",
    questions: [
      {
        id: "listen-b2-1",
        prompt: "Vor welcher Entscheidung stand die Sprecherin?",
        choices: ["Ob sie im Ausland arbeiten oder in der Heimat bleiben soll", "Ob sie einen Kurs machen soll", "Ob sie das Büro wechseln soll", "Ob sie ein Haus kaufen soll"],
        answer: "Ob sie im Ausland arbeiten oder in der Heimat bleiben soll",
        explanation: "Sie überlegte, ob sie im Ausland arbeiten oder in der Heimat bleiben soll.",
      },
      {
        id: "listen-b2-2",
        prompt: "Warum hat sie sich für die Auslandserfahrung entschieden?",
        choices: ["Weil sie neue Chancen eröffnet", "Weil die Heimat zu teuer ist", "Weil sie kein Angebot in der Heimat hatte", "Weil es leichter ist"],
        answer: "Weil sie neue Chancen eröffnet",
        explanation: "Sie sagt, die neue Position eröffnet neue Chancen.",
      },
      {
        id: "listen-b2-3",
        prompt: "Was verlangt die neue Position?",
        choices: ["Viel Verantwortung", "Wenig Arbeit", "Keine Reisen", "Gute Bezahlung"],
        answer: "Viel Verantwortung",
        explanation: "Die Position verlangt viel Verantwortung.",
      },
    ],
  },
];

export function getListeningLessonsForLevel(level: UserLevel) {
  return listeningLessons.filter((lesson) => lesson.level === level);
}

export const listeningLesson = listeningLessons[1];

export type ReadingLesson = {
  title: string;
  level: UserLevel;
  duration: string;
  description: string;
  text: string;
  questions: Exercise[];
};

export const readingLessons: ReadingLesson[] = [
  {
    title: "Mening do‘stim va uyim",
    level: "A1",
    duration: "3 daqiqa",
    description: "Oddiy kundalik hayot haqida qisqa matn.",
    text: `Hallo! Ich heiße Ali. Ich wohne in Samarkand. Ich bin 17 Jahre alt. Meine Familie ist klein. Meine Mutter arbeitet in einem Krankenhaus, und mein Vater arbeitet im Büro. Am Wochenende gehe ich oft mit meinen Freunden spazieren. Ich lerne gern Deutsch, weil ich nach Deutschland fahren möchte.`,
    questions: [
      {
        id: "read-a1-1",
        prompt: "Wie heißt der Junge?",
        choices: ["Ali", "Murat", "Jon", "Samir"],
        answer: "Ali",
        explanation: "Der Text beginnt mit: „Ich heiße Ali“.",
      },
      {
        id: "read-a1-2",
        prompt: "Wo wohnt Ali?",
        choices: ["In Samarkand", "In Berlin", "In Tashkent", "In Bukhara"],
        answer: "In Samarkand",
        explanation: "Der Text sagt, dass er in Samarkand wohnt.",
      },
      {
        id: "read-a1-3",
        prompt: "Was lernt Ali gern?",
        choices: ["Deutsch", "Mathe", "Sport", "Kochen"],
        answer: "Deutsch",
        explanation: "Ali lernt gern Deutsch.",
      },
    ],
  },
  {
    title: "Verspäteter Zug: Beschwerde und Erstattung",
    level: "A2",
    duration: "5 daqiqa",
    description: "Ein Beschwerdebrief über einen verspäteten Regionalzug mit konkreten Forderungen.",
    text: `Sehr geehrte Damen und Herren,

am Montag, den 18. Juni, wollte ich mit dem Regionalzug 7435 von Hannover nach Hamburg reisen. Der Zug sollte um 8:10 Uhr abfahren. Tatsächlich startete die Fahrt erst um 9:05 Uhr. Während der Wartezeit erhielten wir keine Informationen vom Bahnpersonal. Auf dem Bahnsteig stand nur ein Aushang mit dem Hinweis „Technische Störung“. Die Verspätung betrug schließlich 55 Minuten.

Ich hatte ein Arbeitstreffen in Hamburg um 11:00 Uhr. Durch die Verzögerung habe ich den Termin verpasst und eine zusätzliche Taxifahrt zum neuen Termin bezahlt. Ich bitte Sie deshalb um Erstattung meines Tickets und um eine schriftliche Entschuldigung. Meine Fahrkarte war ein Sparpreis-Ticket, gekauft am 15. Juni, Sitzplatzreservierung inklusive.

Mit freundlichen Grüßen
Anna Keller`,
    questions: [
      {
        id: "read-1",
        prompt: "An welchem Tag wollte die Autorin reisen?",
        choices: ["Am Montag, den 18. Juni", "Am Dienstag, den 19. Juni", "Am Mittwoch, den 17. Juni", "Am Donnerstag, den 20. Juni"],
        answer: "Am Montag, den 18. Juni",
        explanation: "Der Brief beginnt mit: ‚am Montag, den 18. Juni‘.",
      },
      {
        id: "read-2",
        prompt: "Mit welchem Zug sollte die Autorin fahren?",
        choices: ["Regionalzug 7435", "ICE 1250", "Intercity 902", "Schnellzug 4310"],
        answer: "Regionalzug 7435",
        explanation: "Sie schreibt: ‚Regionalzug 7435‘.",
      },
      {
        id: "read-3",
        prompt: "Von welcher Stadt nach welcher Stadt fuhr sie?",
        choices: ["Von Hamburg nach Hannover", "Von Hannover nach Hamburg", "Von Berlin nach Hamburg", "Von Hannover nach Bremen"],
        answer: "Von Hannover nach Hamburg",
        explanation: "Der Brief nennt ‚von Hannover nach Hamburg‘.",
      },
      {
        id: "read-4",
        prompt: "Wie spät sollte der Zug ursprünglich abfahren?",
        choices: ["8:10 Uhr", "9:05 Uhr", "10:00 Uhr", "7:55 Uhr"],
        answer: "8:10 Uhr",
        explanation: "Er sollte um 8:10 Uhr abfahren.",
      },
      {
        id: "read-5",
        prompt: "Wann fuhr der Zug schließlich los?",
        choices: ["9:05 Uhr", "8:10 Uhr", "10:00 Uhr", "8:55 Uhr"],
        answer: "9:05 Uhr",
        explanation: "Die Fahrt startete erst um 9:05 Uhr.",
      },
      {
        id: "read-6",
        prompt: "Wie lange dauerte die Verspätung?",
        choices: ["55 Minuten", "30 Minuten", "1 Stunde 20 Minuten", "45 Minuten"],
        answer: "55 Minuten",
        explanation: "Die Verspätung betrug schließlich 55 Minuten.",
      },
      {
        id: "read-7",
        prompt: "Welche Information gab es am Bahnsteig?",
        choices: ["Eine Durchsage ohne Details", "Ein Aushang mit ‚Technische Störung‘", "Ein Flyer über Fahrpläne", "Eine Karte mit Verspätungen"],
        answer: "Ein Aushang mit ‚Technische Störung‘",
        explanation: "Auf dem Bahnsteig stand nur ein Aushang mit diesem Hinweis.",
      },
      {
        id: "read-8",
        prompt: "Warum verpasste die Autorin ihren Termin?",
        choices: ["Wegen des verspäteten Zuges", "Wegen einer Verkehrsstörung in Hamburg", "Wegen Krankheit", "Wegen eines Streiks"],
        answer: "Wegen des verspäteten Zuges",
        explanation: "Durch die Verzögerung hat sie den Termin verpasst.",
      },
      {
        id: "read-9",
        prompt: "Wann fand das Arbeitstreffen statt?",
        choices: ["Um 11:00 Uhr", "Um 9:00 Uhr", "Um 14:00 Uhr", "Um 10:30 Uhr"],
        answer: "Um 11:00 Uhr",
        explanation: "Das Treffen war für 11:00 Uhr geplant.",
      },
      {
        id: "read-10",
        prompt: "Welche zusätzliche Ausgabe hatte die Autorin?",
        choices: ["Eine Taxifahrt", "Eine Hotelübernachtung", "Ein neues Ticket", "Ein Taxi zum Bahnhof"],
        answer: "Eine Taxifahrt",
        explanation: "Sie bezahlte eine zusätzliche Taxifahrt zum neuen Termin.",
      },
      {
        id: "read-11",
        prompt: "Welche Art von Fahrkarte hatte sie?",
        choices: ["Sparpreis-Ticket", "Flexpreis-Ticket", "Firmenticket", "Ein Tagesticket"],
        answer: "Sparpreis-Ticket",
        explanation: "Ihre Fahrkarte war ein Sparpreis-Ticket.",
      },
      {
        id: "read-12",
        prompt: "Was war im Ticket enthalten?",
        choices: ["Sitzplatzreservierung", "Fahrradmitnahme", "Ein Snack-Gutschein", "Kein Sitzplatz"],
        answer: "Sitzplatzreservierung",
        explanation: "Das Ticket war mit Sitzplatzreservierung inklusive.",
      },
      {
        id: "read-13",
        prompt: "Wofür bittet sie die Bahn?",
        choices: ["Um Erstattung und Entschuldigung", "Um ein kostenloses Frühstück", "Um eine Zugfahrt nach Berlin", "Um eine neue Fahrkarte"],
        answer: "Um Erstattung und Entschuldigung",
        explanation: "Sie bittet um Erstattung ihres Tickets und um eine schriftliche Entschuldigung.",
      },
      {
        id: "read-14",
        prompt: "Wann wurde das Ticket gekauft?",
        choices: ["Am 15. Juni", "Am 18. Juni", "Am 14. Juni", "Am 10. Juni"],
        answer: "Am 15. Juni",
        explanation: "Es wurde am 15. Juni gekauft.",
      },
      {
        id: "read-15",
        prompt: "Wer unterschreibt den Brief?",
        choices: ["Anna Keller", "Murat Yilmaz", "Herr Weber", "Das Bahnteam"],
        answer: "Anna Keller",
        explanation: "Der Brief endet mit ‚Anna Keller‘.",
      },
    ] satisfies Exercise[],
  },
  {
    title: "Neue Ausstellung im Kulturzentrum",
    level: "B1",
    duration: "6 daqiqa",
    description: "Ein informativer Text über eine Ausstellung, Führungen und Umweltworkshops.",
    text: `Sehr geehrte Besucherinnen und Besucher,

das Stadtmuseum eröffnet ab Donnerstag eine neue Ausstellung zum Thema „Stadt und Wasser“. Die Ausstellung zeigt Fotografien, historische Karten und Interviews mit Anwohnern. Jeden Mittwoch und Samstag gibt es um 17 Uhr eine kostenlose Führung. Am Eröffnungswochenende ist der Eintritt für Jugendliche bis 18 Jahre frei.

Besonders interessant sind die Interviews mit den Bootsbauern, die erzählen, wie sich der Hafen in den letzten zwanzig Jahren verändert hat. Außerdem bietet das Museum einen Workshop zum Thema „Umweltschutz am Fluss“ für Schulklassen an. Die Öffnungszeiten sind dienstags bis sonntags von 10 bis 18 Uhr.

Bitte beachten Sie, dass der Besucherparkplatz nur begrenzt ist. Für Fahrräder stehen kostenlose Abstellplätze zur Verfügung. Wir freuen uns auf Ihren Besuch.

Mit freundlichen Grüßen
Das Team des Stadtmuseums`,
    questions: [
      {
        id: "read2-1",
        prompt: "Worum geht es in der neuen Ausstellung?",
        choices: ["Stadt und Wasser", "Sport und Freizeit", "Kochen und Ernährung", "Musik und Tanz"],
        answer: "Stadt und Wasser",
        explanation: "Die Ausstellung heißt ‚Stadt und Wasser‘.",
      },
      {
        id: "read2-2",
        prompt: "Welche Exponate sind in der Ausstellung zu sehen?",
        choices: ["Fotografien, Karten und Interviews", "Gemälde und Skulpturen", "Laptops und Filme", "Musikinstrumente"],
        answer: "Fotografien, Karten und Interviews",
        explanation: "Es werden Fotografien, historische Karten und Interviews gezeigt.",
      },
      {
        id: "read2-3",
        prompt: "An welchen Tagen gibt es kostenlose Führungen?",
        choices: ["Mittwoch und Samstag", "Montag und Donnerstag", "Dienstag und Freitag", "Samstag und Sonntag"],
        answer: "Mittwoch und Samstag",
        explanation: "Kostenlose Führungen finden mittwochs und samstags statt.",
      },
      {
        id: "read2-4",
        prompt: "Um welche Uhrzeit beginnen die Führungen?",
        choices: ["17 Uhr", "10 Uhr", "15 Uhr", "18 Uhr"],
        answer: "17 Uhr",
        explanation: "Die Führungen sind um 17 Uhr.",
      },
      {
        id: "read2-5",
        prompt: "Wer hat am Eröffnungswochenende freien Eintritt?",
        choices: ["Jugendliche bis 18 Jahre", "Erwachsene", "Senioren", "Schulklassen"],
        answer: "Jugendliche bis 18 Jahre",
        explanation: "Jugendliche bis 18 Jahre dürfen frei rein.",
      },
      {
        id: "read2-6",
        prompt: "Was erzählen die Bootsbauer?",
        choices: ["Wie sich der Hafen verändert hat", "Wie man ein Boot baut", "Wie man angelt", "Wie man reist"],
        answer: "Wie sich der Hafen verändert hat",
        explanation: "Sie berichten über die Veränderungen des Hafens.",
      },
      {
        id: "read2-7",
        prompt: "Welches Thema hat der Workshop?",
        choices: ["Umweltschutz am Fluss", "Malerei am Fluss", "Kochen mit Wasser", "Sport am Fluss"],
        answer: "Umweltschutz am Fluss",
        explanation: "Der Workshop heißt ‚Umweltschutz am Fluss‘.",
      },
      {
        id: "read2-8",
        prompt: "Für welche Besuchergruppe ist der Workshop besonders gedacht?",
        choices: ["Schulklassen", "Senioren", "Familien", "Touristen"],
        answer: "Schulklassen",
        explanation: "Der Workshop ist für Schulklassen.",
      },
      {
        id: "read2-9",
        prompt: "Wann ist das Museum geöffnet?",
        choices: ["Dienstag bis Sonntag von 10 bis 18 Uhr", "Montag bis Freitag von 9 bis 17 Uhr", "Samstag und Sonntag von 10 bis 16 Uhr", "Täglich von 8 bis 20 Uhr"],
        answer: "Dienstag bis Sonntag von 10 bis 18 Uhr",
        explanation: "Die Öffnungszeiten sind dienstags bis sonntags von 10 bis 18 Uhr.",
      },
      {
        id: "read2-10",
        prompt: "Was ist mit dem Parkplatz?",
        choices: ["Er ist nur begrenzt verfügbar", "Er ist kostenlos", "Er ist geschlossen", "Er ist sehr groß"],
        answer: "Er ist nur begrenzt verfügbar",
        explanation: "Der Besucherparkplatz ist nur begrenzt.",
      },
      {
        id: "read2-11",
        prompt: "Was bietet das Museum für Fahrräder an?",
        choices: ["Kostenlose Abstellplätze", "Fahrradverleih", "Reparaturservice", "Garagenplätze"],
        answer: "Kostenlose Abstellplätze",
        explanation: "Für Fahrräder stehen kostenlose Abstellplätze zur Verfügung.",
      },
      {
        id: "read2-12",
        prompt: "Wer hat das Schreiben unterschrieben?",
        choices: ["Das Team des Stadtmuseums", "Der Bürgermeister", "Eine Schülerin", "Der Bibliothekar"],
        answer: "Das Team des Stadtmuseums",
        explanation: "Der Brief endet mit ‚Das Team des Stadtmuseums‘.",
      },
      {
        id: "read2-13",
        prompt: "Wohin sollten Besucher besonders hinschauen?",
        choices: ["Zu den Interviews mit den Bootsbauern", "Zu den Filmvorführungen", "Zu den Sportübungen", "Zu den Kochkursen"],
        answer: "Zu den Interviews mit den Bootsbauern",
        explanation: "Die Interviews mit den Bootsbauern sind besonders interessant.",
      },
      {
        id: "read2-14",
        prompt: "Welche Art von Informationen liefert der Text?",
        choices: ["Details über eine Ausstellung und Veranstaltungen", "Eine Wettervorhersage", "Eine Sportnachricht", "Einen Einkaufsführer"],
        answer: "Details über eine Ausstellung und Veranstaltungen",
        explanation: "Der Text beschreibt die Ausstellung und ergänzende Angebote.",
      },
      {
        id: "read2-15",
        prompt: "Welches Alter ist explizit für freien Eintritt genannt?",
        choices: ["Bis 18 Jahre", "Bis 16 Jahre", "Bis 12 Jahre", "Bis 21 Jahre"],
        answer: "Bis 18 Jahre",
        explanation: "Der Eintritt ist für Jugendliche bis 18 Jahre frei.",
      },
    ] satisfies Exercise[],
  },
  {
    title: "Nachhaltige Stadtentwicklung",
    level: "B2",
    duration: "6 daqiqa",
    description: "Ein Text über Planung, Umweltschutz und Mobilität in modernen Städten.",
    text: `In vielen Städten wächst das Interesse an nachhaltiger Stadtentwicklung. Die Planer berücksichtigen dabei den Verkehr, den Wohnraum und die Grünflächen. Ein Schwerpunkt liegt auf emissionsfreien Verkehrsmitteln, Carsharing und Fahrradwegen. Auch die Nutzung energieeffizienter Gebäude spielt eine Rolle. Gleichzeitig müssen die Bedürfnisse verschiedener Bevölkerungsgruppen berücksichtigt werden, damit die Stadt lebenswert bleibt.

In diesem Text werden Chancen und Herausforderungen beschrieben: Wie lassen sich historische Gebäude erhalten und gleichzeitig innovative Lösungen integrieren? Welche Rolle spielt die Beteiligung der Bürgerinnen und Bürger? Ein erfolgreiches Konzept verbindet funktionale Infrastruktur mit sozialer Verantwortung und ökologischer Nachhaltigkeit.
`,
    questions: [
      {
        id: "read-b2-1",
        prompt: "Worauf liegt ein Schwerpunkt in der Stadtentwicklung?",
        choices: ["Emissionsfreie Verkehrsmittel", "Neue Einkaufszentren", "Günstige Wohnungen", "Höhere Steuern"],
        answer: "Emissionsfreie Verkehrsmittel",
        explanation: "Der Text nennt emissionsfreie Verkehrsmittel als Schwerpunkt.",
      },
      {
        id: "read-b2-2",
        prompt: "Was soll gleichzeitig berücksichtigt werden?",
        choices: ["Die Bedürfnisse verschiedener Bevölkerungsgruppen", "Nur die Wirtschaft", "Nur Touristen", "Nur Autofahrer"],
        answer: "Die Bedürfnisse verschiedener Bevölkerungsgruppen",
        explanation: "Der Text betont die Berücksichtigung verschiedener Bevölkerungsgruppen.",
      },
      {
        id: "read-b2-3",
        prompt: "Welche Infrastruktur soll verbunden werden?",
        choices: ["Funktionale Infrastruktur mit sozialer Verantwortung", "Nur neue Straßen", "Nur Parks", "Nur Wohnraum"],
        answer: "Funktionale Infrastruktur mit sozialer Verantwortung",
        explanation: "Das erfolgreiche Konzept verbindet Infrastruktur mit sozialer Verantwortung.",
      },
      {
        id: "read-b2-4",
        prompt: "Was ist eine Herausforderung beim Erhalt der Stadt?",
        choices: ["Historische Gebäude erhalten und Innovation integrieren", "Mehr Autos erlauben", "Kräftigere Werbung machen", "Weniger Grünflächen schaffen"],
        answer: "Historische Gebäude erhalten und Innovation integrieren",
        explanation: "Der Text beschreibt diese Herausforderung.",
      },
      {
        id: "read-b2-5",
        prompt: "Welche Rolle spielt die Beteiligung der Bürgerinnen und Bürger?",
        choices: ["Sie spielt eine Rolle", "Sie spielt keine Rolle", "Sie ist verboten", "Sie ist unwichtig"],
        answer: "Sie spielt eine Rolle",
        explanation: "Der Text fragt nach der Rolle der Beteiligung.",
      },
    ] satisfies Exercise[],
  },
];

export function getReadingLessonsForLevel(level: UserLevel) {
  return readingLessons.filter((lesson) => lesson.level === level);
}

export const readingLesson = readingLessons[0];

export type VocabularyCard = {
  id: string;
  german: string;
  article?: string;
  uzbek: string;
  example: string;
  category: string;
  interval: number;
  nextReview: string;
  level: VocabularyLevel;
};

const today = new Date().toISOString();

export const starterVocabulary: VocabularyCard[] = [
  { id: "wort-1", article: "der", german: "Fortschritt", uzbek: "taraqqiyot, rivojlanish", example: "Ich mache jeden Tag Fortschritte.", category: "O‘qish", interval: 0, nextReview: today, level: "B1" },
  { id: "wort-2", article: "die", german: "Gewohnheit", uzbek: "odat", example: "Deutschlernen ist meine neue Gewohnheit.", category: "O‘qish", interval: 0, nextReview: today, level: "A2" },
  { id: "wort-3", article: "das", german: "Ziel", uzbek: "maqsad", example: "Mein Ziel ist die B1-Prüfung.", category: "O‘qish", interval: 0, nextReview: today, level: "A2" },
  { id: "wort-4", article: "die", german: "Reise", uzbek: "sayohat", example: "Die Reise nach Deutschland war toll.", category: "Sayohat", interval: 0, nextReview: today, level: "A1" },
  { id: "wort-5", article: "der", german: "Bahnhof", uzbek: "vokzal", example: "Der Bahnhof ist nicht weit von hier.", category: "Sayohat", interval: 0, nextReview: today, level: "A1" },
  { id: "wort-6", article: "das", german: "Gespräch", uzbek: "suhbat", example: "Das Gespräch war sehr interessant.", category: "Muloqot", interval: 0, nextReview: today, level: "A2" },
  { id: "wort-7", article: "die", german: "Antwort", uzbek: "javob", example: "Ich kenne die Antwort nicht.", category: "Muloqot", interval: 0, nextReview: today, level: "A1" },
  { id: "wort-8", article: "der", german: "Vorschlag", uzbek: "taklif", example: "Dein Vorschlag ist gut.", category: "Ish", interval: 0, nextReview: today, level: "A2" },
  { id: "wort-9", article: "die", german: "Erfahrung", uzbek: "tajriba", example: "Sie hat viel Erfahrung.", category: "Ish", interval: 0, nextReview: today, level: "B1" },
  { id: "wort-10", article: "das", german: "Wetter", uzbek: "ob-havo", example: "Das Wetter ist heute schön.", category: "Kundalik", interval: 0, nextReview: today, level: "A1" },
  { id: "wort-11", article: "der", german: "Unterschied", uzbek: "farq", example: "Was ist der Unterschied?", category: "Kundalik", interval: 0, nextReview: today, level: "A2" },
  { id: "wort-12", article: "die", german: "Möglichkeit", uzbek: "imkoniyat", example: "Das ist eine gute Möglichkeit.", category: "O‘qish", interval: 0, nextReview: today, level: "B1" },
  { id: "wort-13", article: "die", german: "Familie", uzbek: "oila", example: "Meine Familie ist sehr nett.", category: "Kundalik", interval: 0, nextReview: today, level: "A1" },
  { id: "wort-14", article: "der", german: "Freund", uzbek: "do‘st", example: "Mein Freund wohnt in Samarkand.", category: "Muloqot", interval: 0, nextReview: today, level: "A1" },
  { id: "wort-15", article: "die", german: "Prüfung", uzbek: "imtihon", example: "Die Prüfung beginnt um 10 Uhr.", category: "Ta'lim", interval: 0, nextReview: today, level: "A2" },
  { id: "wort-16", article: "der", german: "Termin", uzbek: "muddat, uchrashuv", example: "Wir haben einen Termin um drei Uhr.", category: "Ish", interval: 0, nextReview: today, level: "A2" },
  { id: "wort-17", article: "die", german: "Diskussion", uzbek: "muhokama", example: "Die Diskussion war sehr interessant.", category: "Muloqot", interval: 0, nextReview: today, level: "B1" },
  { id: "wort-18", article: "die", german: "Verantwortung", uzbek: "mas'uliyat", example: "Er übernimmt die Verantwortung.", category: "Ish", interval: 0, nextReview: today, level: "B1" },
  { id: "wort-19", article: "die", german: "Verhandlung", uzbek: "muzokara", example: "Die Verhandlung dauerte mehrere Stunden.", category: "Ish", interval: 0, nextReview: today, level: "B2" },
  { id: "wort-20", article: "das", german: "Fachwissen", uzbek: "mutaxassislik bilimlari", example: "Er hat viel Fachwissen in seinem Bereich.", category: "Ta'lim", interval: 0, nextReview: today, level: "B2" },
  { id: "wort-21", article: "der", german: "Sachverhalt", uzbek: "holat, vaziyat", example: "Der Sachverhalt war komplex und schwierig zu erklären.", category: "Ish", interval: 0, nextReview: today, level: "B2" },
  { id: "wort-22", article: "die", german: "Transparenz", uzbek: "oshkoralik", example: "Transparenz schafft Vertrauen.", category: "Ish", interval: 0, nextReview: today, level: "B2" },
  { id: "wort-23", article: "die", german: "Nachhaltigkeit", uzbek: "barqarorlik", example: "Nachhaltigkeit ist ein zentrales Thema.", category: "Ta'lim", interval: 0, nextReview: today, level: "B2" },
  { id: "wort-24", article: "die", german: "Priorität", uzbek: "ustuvorlik", example: "Die Priorität liegt auf Qualität.", category: "Ish", interval: 0, nextReview: today, level: "B2" },
  { id: "wort-25", article: "die", german: "Kompetenz", uzbek: "malaka", example: "Er zeigt große Kompetenz in seinem Fach.", category: "Ish", interval: 0, nextReview: today, level: "B2" },
];

export const writingPrompts = [
  {
    id: "intro-a1",
    title: "O‘zingizni tanishtiring",
    level: "A1",
    prompt:
      "50–60 so‘zdan iborat kichik matnda o‘zingiz haqida yozing: ism, yosh, qayerda yashaysiz, nima qilasiz va nemis tilini qayerda o‘rganmoqchisiz.",
    helper: ["Ich, wohne, lerne kabi oddiy so‘zlardan foydalaning", "Har bir gapni qisqa qiling", "Salomlashuv bilan boshlang"],
  },
  {
    id: "routine-a2",
    title: "Kundalik rejangiz",
    level: "A2",
    prompt:
      "Har kuni qanday o‘tkazishingizni 60–80 so‘zda tasvirlang. Qachon uyg‘onishingiz, nima qilishingiz va qanday dam olishingiz haqida yozing.",
    helper: ["Am Morgen, am Abend kabi iboralardan foydalaning", "weil yoki dann bilan bog‘lang", "Yaxshi yakun bering"],
  },
  {
    id: "story-a2",
    title: "Qisqa hikoya",
    level: "A2",
    prompt:
      "„Letztes Wochenende hatte ich eine Überraschung.“ jumlasi bilan boshlanadigan 60–80 so‘zli kichik hikoya yozing.",
    helper: ["Perfekt zamonidan foydalaning", "Vaqt bildiruvchi so‘zlar qo‘shing", "Hikoyani aniq yakunlang"],
  },
  {
    id: "email",
    title: "Rasmiy e-mail",
    level: "B1",
    prompt:
      "Siz nemis tili kursiga yozilgansiz, ammo birinchi darsga bora olmaysiz. Kurs o‘qituvchisiga 80–100 so‘zdan iborat e-mail yozing. Sababini tushuntiring va keyingi dars haqida so‘rang.",
    helper: ["Salomlashuvni unutmang", "Sababni aniq ayting", "Savol bilan yakunlang"],
  },
  {
    id: "opinion",
    title: "Fikr bildirish",
    level: "B1",
    prompt:
      "„Online lernen ist besser als im Klassenzimmer lernen.“ Mavzusi bo‘yicha fikringizni 80–100 so‘zda yozing. Kamida bitta afzallik va bitta kamchilikni keltiring.",
    helper: ["Fikringizni boshida ayting", "weil, aber, deshalb kabi bog‘lovchilardan foydalaning", "Xulosa yozing"],
  },
  {
    id: "email-b2",
    title: "Rasmiy ehtiyoj bayoni",
    level: "B2",
    prompt:
      "Siz ish beruvchingizga nemis tilida 100–120 so‘zli rasmiy xat yozishingiz kerak. Xatga loyihaga oid muammolar, takliflar va keyingi qadamlarni kiritishingiz kerak.",
    helper: ["Aniq va rasmiy uslubda yozing", "Maqsadni va taklifni aniq bayon qiling", "Xatni savol yoki talab bilan yakunlang"],
  },
];

export function getWritingPromptsForLevel(level: UserLevel) {
  return writingPrompts.filter((prompt) => prompt.level === level);
}
