import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <Link href="/dashboard" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="deutsch.gg bosh sahifasi">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-forest text-base font-black tracking-[-0.08em] text-white shadow-[0_7px_18px_rgba(24,92,72,0.22)] transition-transform group-hover:-rotate-3 group-hover:scale-105">
        d
        <i aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-full bg-lime" />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-[-0.055em] text-ink">deutsch.gg</span>
          <span className="mt-1 text-[10px] font-bold tracking-[0.09em] text-[#778883]">NEMIS TILI, HAR KUNI</span>
        </span>
      ) : null}
    </Link>
  );
}
