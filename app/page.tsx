import Link from "next/link";
import { ArrowRight, CheckCircle2, Headphones, MessageCircle, Sparkles, Trophy } from "lucide-react";
import { Brand } from "@/components/brand";

const features = [
  { icon: MessageCircle, title: "AI bilan gaplashing", text: "Nemischa suhbat qiling, talaffuz va xatolaringiz bo‘yicha muloyim fikr oling." },
  { icon: Sparkles, title: "Aqlli mashqlar", text: "Grammatika, lug‘at va matnlar sizning sur’atingizda bir joyda." },
  { icon: Trophy, title: "Natijani ko‘ring", text: "Kundalik odat, ketma-ket kunlar va CEFR maqsadingizni kuzating." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-paper">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="flex h-20 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <Link href="/login" className="focus-ring rounded-full px-4 py-2 text-sm font-bold text-forest hover:bg-mint">Kirish</Link>
            <Link href="/register" className="focus-ring rounded-full bg-forest px-4 py-2 text-sm font-bold text-white shadow-lg shadow-forest/20 hover:bg-forest/90">Boshlash</Link>
          </div>
        </header>

        <section className="relative grid gap-12 pb-20 pt-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-forest/10 bg-mint px-3 py-1.5 text-xs font-bold text-forest"><span className="h-2 w-2 rounded-full bg-forest" /> A1 dan B2 gacha — har kuni biroz yaxshiroq</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">Nemis tilini <span className="text-forest">gapirib</span> o‘rganing.</h1>
            <p className="mt-7 max-w-xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">deutsch.gg sizga grammatika, tinglash, yozish va AI bilan haqiqiy nemischa suhbatni bitta sodda odatga aylantiradi.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="focus-ring inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-forest/20 hover:-translate-y-0.5 hover:bg-forest/90">Bepul boshlash <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/speaking" className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-ink hover:border-forest/30 hover:bg-mint/40"><MessageCircle className="h-4 w-4 text-forest" /> AI suhbatni sinash</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-forest" /> Kredit karta kerak emas</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-forest" /> O‘zbekcha tushuntirishlar</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -right-12 -top-14 h-56 w-56 rounded-full bg-lime/45 blur-3xl" />
            <div className="absolute -bottom-10 -left-12 h-52 w-52 rounded-full bg-mint blur-3xl" />
            <div className="relative rounded-[2.25rem] border border-white bg-white p-5 shadow-[0_25px_70px_rgba(24,92,72,.17)] sm:p-7">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bugungi suhbat</p><p className="mt-1 text-lg font-extrabold">Café haqida</p></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-xl">☕</span></div>
              <div className="mt-7 space-y-4">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-mint px-4 py-3 text-sm font-semibold text-ink">Hallo! Was möchtest du heute trinken?</div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-forest px-4 py-3 text-sm font-semibold text-white">Ich möchte einen Kaffee, bitte.</div>
                <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-mint px-4 py-3 text-sm leading-relaxed text-ink"><span className="font-bold">Sehr gut!</span> „einen Kaffee“ to‘g‘ri. Möchtest du auch etwas essen?</div>
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-white"><Headphones className="h-5 w-5" /></span><div className="flex-1"><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-3/5 rounded-full bg-lime" /></div><p className="mt-1.5 text-xs font-bold text-slate-500">AI javobini tinglash</p></div></div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-forest/10 bg-white/65 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow text-center">hammasi bitta oqimda</p>
          <h2 className="mx-auto mt-3 max-w-xl text-center text-3xl font-black tracking-tight text-ink sm:text-4xl">Mashq qilishni oson yoqtirib qoling.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => { const Icon = feature.icon; return <article key={feature.title} className="rounded-3xl border border-slate-100 bg-paper p-6 transition hover:-translate-y-1 hover:shadow-soft"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-forest"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-extrabold text-ink">{feature.title}</h3><p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{feature.text}</p></article>; })}
          </div>
        </div>
      </section>
    </main>
  );
}
