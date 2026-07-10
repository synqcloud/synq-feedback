import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary:
    "bg-surface text-fg border border-border hover:bg-surface-hover hover:border-border-strong",
  ghost: "text-fg-muted hover:bg-surface-hover hover:text-fg",
  danger: "bg-danger text-danger-fg hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-8 px-3 text-sm gap-2",
};

export function buttonClasses({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ className, variant = "secondary", size = "md", ...props }: ButtonProps) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}
