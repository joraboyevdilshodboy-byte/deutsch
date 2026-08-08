"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, Mic, X } from "lucide-react";

import { AppSidebar, MobileBottomNavigation, type ShellUser } from "@/components/layout/app-sidebar";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  user?: ShellUser;
  title?: string;
  headerAccessory?: React.ReactNode;
  className?: string;
};

export function AppShell({ children, user, title, headerAccessory, className }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="fixed inset-y-5 left-5 z-30 hidden w-[260px] lg:block">
        <AppSidebar user={user} />
      </div>

      <div className="min-h-screen lg:pl-[300px]">
        <header className="sticky top-0 z-20 border-b border-[#e7ece8]/80 bg-paper/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-forest transition-colors hover:bg-[#e8f1ea] lg:hidden"
                aria-label="Menyuni ochish"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Logo compact className="lg:hidden" />
              {title ? <p className="hidden truncate text-sm font-extrabold text-ink sm:block lg:text-base">{title}</p> : null}
            </div>

            <div className="flex items-center gap-2">
              {headerAccessory}
              <Link href="/speaking" className={cn(buttonClasses({ variant: "lime", size: "sm" }), "hidden sm:inline-flex")}>
                <Mic className="h-4 w-4" />
                Suhbatni boshlash
              </Link>
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#61736c] transition-colors hover:bg-[#e8f1ea] hover:text-forest"
                aria-label="Bildirishnomalar"
              >
                <Bell className="h-[19px] w-[19px]" />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-lime ring-2 ring-paper" />
              </button>
            </div>
          </div>
        </header>

        <main className={cn("mx-auto max-w-[1440px] px-4 py-7 pb-28 sm:px-6 sm:py-9 lg:px-8 lg:pb-10", className)}>{children}</main>
      </div>

      <MobileBottomNavigation onOpenMenu={() => setMobileMenuOpen(true)} />

      <div
        className={cn(
          "fixed inset-0 z-50 bg-[#132321]/35 transition-opacity lg:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Asosiy menyu"
        className={cn(
          "fixed inset-y-3 left-3 z-50 w-[min(290px,calc(100vw-3rem))] transition-transform duration-300 ease-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]",
        )}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2f6f2] text-forest transition-colors hover:bg-mint"
          aria-label="Menyuni yopish"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
        <AppSidebar user={user} onNavigate={() => setMobileMenuOpen(false)} />
      </div>
    </div>
  );
}
