import * as React from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfddd4] bg-[#fbfdfb] px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-forest">{icon}</div>
      <h2 className="mt-4 text-lg font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
      {description ? <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#667872]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
