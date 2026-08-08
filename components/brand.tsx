import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 focus-ring rounded-xl" aria-label="deutsch.gg bosh sahifasi">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-base font-black text-lime transition-transform group-hover:-rotate-6">
        d.
      </span>
      {!compact && <span className="text-lg font-extrabold tracking-tight text-ink">deutsch<span className="text-forest">.gg</span></span>}
    </Link>
  );
}
