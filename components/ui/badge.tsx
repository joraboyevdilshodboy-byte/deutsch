import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-[#eef5ef] text-forest",
  lime: "bg-lime/70 text-[#375112]",
  blue: "bg-[#e6f1ff] text-[#2861a2]",
  amber: "bg-[#fff2d5] text-[#9a5b08]",
  red: "bg-[#fde7e7] text-[#a52d2d]",
  neutral: "bg-[#f1f3f2] text-[#586964]",
} as const;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold leading-none",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
