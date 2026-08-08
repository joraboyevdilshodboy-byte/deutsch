import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Headphones, MessageCircle, PenLine, Sparkles, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CurrentLevelBadge } from "@/components/current-level-badge";
import { getDashboardSummary, type DashboardSection } from "@/lib/dashboard";

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Headphones,
  MessageCircle,
  PenLine,
};

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const name = summary?.name ?? "Til o‘rganuvchi";
  const sections = summary?.sections ?? [];
  const level = summary?.level ?? "Aniqlanmagan";
  const streak = summary?.streak ?? 0;
  const totalXp = summary?.totalXp ?? 0;
  const todayMinutes = summary?.todayMinutes ?? 0;
  const weeklyActivity = summary?.weeklyActivity ?? [];

  return (
    <AppShell title="Bosh sahifa" subtitle="Bugun nemischa gaplashish uchun ajoyib kun.">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest px-6 py-7 text-white shadow-xl shadow-forest/20 sm:px-8 sm:py-9">
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-bold text-lime">Guten Tag, {name}! 👋</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Bugungi kichik qadam — ertangi katta ishonch.</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">Maqsadingizga yetish uchun atigi 5 daqiqa AI bilan suhbat yetadi.</p>
            <Link href="/speaking" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-3 text-sm font-extrabold text-forest hover:bg-white">Suhbatni boshlash <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="absolute -bottom-20 -right-14 h-64 w-64 rounded-full border-[34px] border-white/10" />
          <div className="absolute right-9 top-7 text-5xl opacity-90">💬</div>
        </div>

        <div className="app-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">kunlik maqsad</p>
              <h2 className="mt-1 text-xl font-black text-ink">2 soat</h2>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest"><Target className="h-6 w-6" /></span>
          </div>
          <div className="mt-7 flex items-end gap-4">
            <span className="text-4xl font-black text-ink">{todayMinutes}</span>
            <span className="mb-1 text-sm font-bold text-slate-500">/ 120 daqiqa</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-forest" style={{ width: `${Math.min(100, (todayMinutes / 120) * 100)}%` }} />
          </div>
          <p className="mt-3 text-xs font-semibold text-forest">Yana {Math.max(0, 120 - todayMinutes)} daqiqa — bugungi seriya saqlanadi!</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="app-card flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-xl">🔥</span><div><p className="text-2xl font-black text-ink">{streak}</p><p className="text-xs font-bold text-slate-500">kunlik ketma-ketlik</p></div></div>
        <div className="app-card flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-forest"><TrendingUp className="h-5 w-5" /></span><div><CurrentLevelBadge fallback={level} /><p className="text-xs font-bold text-slate-500">hozirgi daraja</p></div></div>
        <div className="app-card flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Sparkles className="h-5 w-5" /></span><div><p className="text-2xl font-black text-ink">{totalXp}</p><p className="text-xs font-bold text-slate-500">jami XP</p></div></div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">davom eting</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-ink">Siz uchun mashqlar</h2>
          </div>
          <Link href="/progress" className="focus-ring text-sm font-extrabold text-forest hover:underline">Barcha statistikalar</Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section: DashboardSection) => {
            const Icon = iconMap[section.icon] ?? BookOpen;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="focus-ring group rounded-3xl border border-white bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${section.color}`}><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-base font-extrabold text-ink">{section.title}</h3>
                <p className="mt-1 h-9 text-xs font-semibold leading-relaxed text-slate-500">{section.text}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${section.bar}`} style={{ width: `${section.progress}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{section.progress}% yakunlandi</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="app-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">haftalik faoliyat</p>
              <h2 className="mt-1 text-xl font-black text-ink">Barqarorlikni saqlang</h2>
            </div>
            <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-forest">Bu hafta</span>
          </div>
          <div className="mt-7 flex h-28 items-end justify-between gap-2">
            {weeklyActivity.map(({ day, minutes, height }, index) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-20 w-full max-w-8 items-end rounded-lg bg-slate-50 px-1">
                  <div className={`w-full rounded-md ${index === 5 ? "bg-lime" : "bg-forest/80"}`} style={{ height: `${height}%` }} title={`${minutes} daqiqa`} />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-forest/10 bg-mint p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-forest"><CheckCircle2 className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-extrabold text-ink">Keyingi maqsad</p>
              <p className="text-xs font-semibold text-forest/70">B1 darajasiga yo‘l</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium leading-relaxed text-forest/85">Yana 3 ta grammatika darsi va 2 ta yozish topshirig‘ini yakunlang.</p>
          <Link href="/grammar" className="focus-ring mt-5 inline-flex rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-forest hover:bg-forest hover:text-white">Mavzularni ko‘rish</Link>
        </div>
      </section>
    </AppShell>
  );
}
