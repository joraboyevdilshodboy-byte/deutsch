import * as React from "react";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  detail?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

export function StatCard({ label, value, icon, detail, trend = "neutral", className }: StatCardProps) {
  const TrendIcon = trendIcons[trend];
  const trendColor = trend === "up" ? "text-[#37845d]" : trend === "down" ? "text-[#c85454]" : "text-[#778883]";

  return (
    <div
      className={cn(
        "rounded-3xl border border-[#e4ebe5] bg-white p-5 shadow-[0_5px_22px_rgba(19,35,33,0.035)] sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-[#667872]">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef6f0] text-forest">{icon}</span>
      </div>
      <p className="mt-5 text-3xl font-extrabold tracking-[-0.045em] text-ink">{value}</p>
      {detail ? (
        <p className={cn("mt-2 flex items-center gap-1 text-xs font-bold", trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          {detail}
        </p>
      ) : null}
    </div>
  );
}
