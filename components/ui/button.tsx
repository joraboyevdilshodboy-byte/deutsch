import * as React from "react";

import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-forest text-white shadow-[0_10px_24px_rgba(24,92,72,0.22)] hover:bg-[#104938] active:bg-[#0c3c2d]",
  lime:
    "bg-lime text-ink shadow-[0_10px_24px_rgba(176,207,45,0.22)] hover:bg-[#c9e94a] active:bg-[#b9db3b]",
  secondary: "bg-mint text-forest hover:bg-[#ccebd7] active:bg-[#bce2ca]",
  outline:
    "border border-[#d8e2dc] bg-white text-ink hover:border-[#b9cfc4] hover:bg-[#f8fbf8]",
  ghost: "text-[#48605a] hover:bg-[#edf4ef] hover:text-forest",
  danger: "bg-[#c83e3e] text-white hover:bg-[#ae3030]",
} as const;

const sizeClasses = {
  sm: "h-9 gap-1.5 rounded-xl px-3 text-sm",
  md: "h-11 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2 rounded-2xl px-5 text-base",
  icon: "h-10 w-10 rounded-xl p-0",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      {children}
    </button>
  ),
);

Button.displayName = "Button";

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/20",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
