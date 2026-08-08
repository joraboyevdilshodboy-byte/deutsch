import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";

export function AuthLayout({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[1fr_.9fr]">
      <section className="relative hidden overflow-hidden bg-forest p-10 text-white lg:flex lg:flex-col">
        <Brand />
        <div className="relative z-10 my-auto max-w-md">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-lime">KUNIGA 2 SOAT</span>
          <h2 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight">Kichik odat. Katta ishonch.</h2>
          <p className="mt-5 text-base font-medium leading-relaxed text-white/75">Har kuni gapiring, mashq qiling va tilni haqiqiy hayotda ishlata boshlang.</p>
          <ul className="mt-8 space-y-3 text-sm font-semibold text-white/90">
            {["A1–C2 uchun yo‘l xaritasi", "AI bilan nemischa suhbat", "O‘zbekcha tushuntirishlar"].map((item) => <li key={item} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-lime text-forest"><Check className="h-4 w-4 stroke-[3]" /></span>{item}</li>)}
          </ul>
        </div>
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full border-[42px] border-lime/20" />
        <div className="absolute right-16 top-24 h-20 w-20 rounded-[2rem] bg-lime/90" />
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center justify-between lg:hidden"><Brand /><Link href="/" className="focus-ring inline-flex items-center gap-1 text-sm font-bold text-forest"><ArrowLeft className="h-4 w-4" /> Bosh sahifa</Link></div>
          <p className="eyebrow">deutsch.gg ga xush kelibsiz</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
