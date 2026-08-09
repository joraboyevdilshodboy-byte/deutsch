"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  AudioLines,
  BarChart3,
  BookOpen,
  ChevronRight,
  Headphones,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  PenLine,
  Sparkles,
  TestTube2,
  Volume2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { LEVELS, useUserLevel, type UserLevel } from "@/lib/user-level";

const navigation = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/voice", label: "Voice AI Premium", icon: AudioLines },
  { href: "/grammar", label: "Grammatika", icon: BookOpen },
  { href: "/speaking", label: "AI suhbat", icon: MessageCircle },
  { href: "/listening", label: "Tinglash", icon: Headphones },
  { href: "/reading", label: "O‘qish", icon: Volume2 },
  { href: "/writing", label: "Yozish", icon: PenLine },
  { href: "/vocabulary", label: "Lug‘at", icon: Sparkles },
  { href: "/mock-tests", label: "Mock testlar", icon: TestTube2 },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1" aria-label="Asosiy navigatsiya">
      {navigation.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`focus-ring flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
              active ? "bg-forest text-white shadow-lg shadow-forest/20" : "text-slate-600 hover:bg-mint/70 hover:text-forest"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {item.label}
            {active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const [level, setLevel] = useUserLevel();
  const initials = (session?.user?.name || session?.user?.email || "M").slice(0, 1).toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-2 pb-6 pt-1">
        <Brand />
        <button className="focus-ring rounded-xl p-2 text-slate-500 lg:hidden" onClick={() => setOpen(false)} aria-label="Menyuni yopish">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile level selector */}
      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-3 lg:hidden">
        <p className="mb-2 text-xs font-bold text-slate-500">Nemis tili darajangiz:</p>
        <div className="grid grid-cols-3 gap-1.5">
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value as UserLevel)}
              className={`rounded-xl py-2 text-xs font-extrabold transition ${
                level === value
                  ? "bg-forest text-white shadow-md shadow-forest/20"
                  : "border border-slate-200/60 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <NavLinks onNavigate={() => setOpen(false)} />
      <div className="mt-auto rounded-3xl bg-mint p-4">
        <p className="text-xs font-bold text-forest">Bugungi maqsad</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-ink">2 soat mashq qiling</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full w-2/3 rounded-full bg-forest" /></div>
        <p className="mt-2 text-xs font-medium text-forest/75">10 / 120 daqiqa</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/75 bg-white px-5 py-6 lg:block">{sidebar}</aside>
      {open && <button className="fixed inset-0 z-40 bg-ink/30 lg:hidden" aria-label="Menyuni yopish" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white px-5 py-6 shadow-2xl transition-transform lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>{sidebar}</aside>

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-slate-200/70 bg-paper/90 px-4 backdrop-blur md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button className="focus-ring rounded-xl p-2 text-forest lg:hidden" onClick={() => setOpen(true)} aria-label="Menyuni ochish"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0">
              {title && <h1 className="truncate text-lg font-extrabold tracking-tight text-ink sm:text-xl">{title}</h1>}
              {subtitle && <p className="hidden text-xs font-medium text-slate-500 sm:block">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-full border border-slate-200 bg-white p-1 shadow-sm sm:flex dark:border-slate-700 dark:bg-slate-950">
              {LEVELS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLevel(value as UserLevel)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    level === value
                      ? "bg-forest text-white shadow-inner shadow-forest/20"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-forest shadow-sm sm:flex"><span className="text-base">🔥</span> 7 kun</div>
            {status === "authenticated" ? (
              <button onClick={() => signOut({ callbackUrl: "/" })} className="focus-ring flex items-center gap-2 rounded-full bg-white p-1.5 pr-3 text-xs font-bold text-slate-600 shadow-sm hover:text-forest" title="Chiqish">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-lime text-forest">{initials}</span>
                <span className="hidden max-w-24 truncate sm:block">{session.user?.name || "Profil"}</span><LogOut className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link href="/login" className="focus-ring inline-flex items-center gap-2 rounded-full bg-forest px-3 py-2 text-xs font-bold text-white hover:bg-forest/90"><LogIn className="h-3.5 w-3.5" /> Kirish</Link>
            )}
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-9 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
