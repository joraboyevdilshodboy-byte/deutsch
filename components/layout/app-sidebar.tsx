"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  ChevronRight,
  Flame,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Library,
  LogOut,
  Mic,
  PenLine,
  Sparkles,
  TestTube2,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Boshqaruv paneli", shortLabel: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/grammar", label: "Grammatika", shortLabel: "Grammatika", icon: GraduationCap },
  { href: "/speaking", label: "Gapirish", shortLabel: "Gapirish", icon: Mic },
  { href: "/listening", label: "Tinglash", shortLabel: "Tinglash", icon: Headphones },
  { href: "/reading", label: "O‘qish", shortLabel: "O‘qish", icon: BookOpen },
  { href: "/writing", label: "Yozish", shortLabel: "Yozish", icon: PenLine },
  { href: "/vocabulary", label: "Lug‘at", shortLabel: "Lug‘at", icon: Library },
  { href: "/mock-tests", label: "Mock testlar", shortLabel: "Mock test", icon: TestTube2 },
  { href: "/progress", label: "Natijalar", shortLabel: "Natijalar", icon: BarChart3 },
];

export type ShellUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type SidebarProps = {
  user?: ShellUser;
  className?: string;
  onNavigate?: () => void;
  showLogo?: boolean;
};

function userInitial(user?: ShellUser) {
  const source = user?.name || user?.email || "D";
  return source.trim().charAt(0).toUpperCase();
}

export function AppNavigation({ onNavigate }: Pick<SidebarProps, "onNavigate">) {
  const pathname = usePathname() || "/dashboard";

  return (
    <nav aria-label="Asosiy navigatsiya" className="space-y-1.5">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
              isActive
                ? "bg-forest text-white shadow-[0_7px_16px_rgba(24,92,72,0.16)]"
                : "text-[#60716b] hover:bg-[#ecf3ed] hover:text-forest",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-lime" : "text-[#789087] group-hover:text-forest")} strokeWidth={2.25} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ user, className, onNavigate, showLogo = true }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-[28px] border border-[#e2ebe4] bg-white p-4 shadow-[0_15px_45px_rgba(19,35,33,0.08)]",
        className,
      )}
    >
      {showLogo ? <Logo className="mb-7 px-2 pt-1" /> : null}

      <AppNavigation onNavigate={onNavigate} />

      <div className="mt-auto space-y-3 pt-6">
        <Link
          href="/progress"
          onClick={onNavigate}
          className="block rounded-2xl bg-[#eff7f0] p-4 transition-colors hover:bg-[#e4f2e6]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-forest">
              <Flame className="h-4 w-4 text-[#e68b35]" fill="currentColor" />
              Bugungi maqsad
            </span>
            <ChevronRight className="h-4 w-4 text-[#6f8b7c]" />
          </div>
          <p className="mt-2.5 text-sm font-extrabold tracking-[-0.02em] text-ink">2 ta dars bajarildi</p>
          <Progress value={67} className="mt-3" indicatorClassName="bg-lime" />
        </Link>

        <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-forest text-sm font-extrabold text-lime">
            {userInitial(user)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-ink">{user?.name || "Til o‘rganuvchi"}</p>
            <p className="truncate text-xs text-[#788984]">{user?.email || "A2 daraja"}</p>
          </div>
          <Link
            href="/api/auth/signout"
            aria-label="Hisobdan chiqish"
            className="rounded-lg p-1.5 text-[#84938e] transition-colors hover:bg-[#f5f7f5] hover:text-forest"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

type MobileBottomNavigationProps = {
  onOpenMenu: () => void;
};

export function MobileBottomNavigation({ onOpenMenu }: MobileBottomNavigationProps) {
  const pathname = usePathname() || "/dashboard";
  const visibleItems = [navigationItems[0], navigationItems[1], navigationItems[2], navigationItems[6]];

  return (
    <nav
      aria-label="Mobil navigatsiya"
      className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-[#e5ebe6] bg-white/95 px-1 py-2 shadow-[0_14px_34px_rgba(19,35,33,0.16)] backdrop-blur lg:hidden"
    >
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors",
              isActive ? "text-forest" : "text-[#84938e]",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", isActive && "text-forest")} strokeWidth={2.35} />
            <span className="truncate">{item.shortLabel}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold text-[#84938e] transition-colors hover:text-forest"
      >
        <Bookmark className="h-[18px] w-[18px]" strokeWidth={2.35} />
        <span>Ko‘proq</span>
      </button>
    </nav>
  );
}

export function ShellPrompter() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#d7e7db] bg-[#f8fcf8] px-3 py-1.5 text-xs font-bold text-forest">
      <Sparkles className="h-3.5 w-3.5 text-[#86a823]" />
      Har kuni ozgina yaxshiroq
    </div>
  );
}
