"use client";

import { useUserLevel } from "@/lib/user-level";

export function CurrentLevelBadge({ fallback = "A1" }: { fallback?: string }) {
  const [level] = useUserLevel();

  return <span className="text-2xl font-black text-ink">{level ?? fallback}</span>;
}
