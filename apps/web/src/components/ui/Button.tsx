import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  className, variant = "primary", size = "md", ...props
}: Props) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3.5 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  }[size];

  const variants = {
    primary:   "bg-slate-900 text-white hover:opacity-90",
    secondary: "bg-slate-800 text-white hover:opacity-90",
    outline:   "bg-white border border-slate-300 hover:bg-slate-50",
    ghost:     "hover:bg-slate-100",
    danger:    "bg-rose-600 text-white hover:bg-rose-700",
  }[variant];

  return (
    <button
      className={clsx(
        "inline-flex items-center gap-2 rounded-2xl font-medium shadow-sm transition duration-150",
        "cursor-pointer select-none active:translate-y-[1px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/60",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizes, variants, className
      )}
      {...props}
    />
  );
}
