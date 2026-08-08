import * as React from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-forest">{eyebrow}</div>
        ) : null}
        <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-[#667872] sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
