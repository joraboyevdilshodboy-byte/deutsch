import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  indicatorClassName?: string;
  showValue?: boolean;
  label?: string;
};

export function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  showValue = false,
  label,
  ...props
}: ProgressProps) {
  const percentage = Math.round(Math.min(Math.max((value / max) * 100, 0), 100));

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#667872]">
          <span>{label}</span>
          {showValue ? <span className="text-forest">{percentage}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(Math.max(value, 0), max)}
        className="h-2 overflow-hidden rounded-full bg-[#e9efeb]"
      >
        <div
          className={cn(
            "h-full rounded-full bg-forest transition-[width] duration-500 ease-out",
            indicatorClassName,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
