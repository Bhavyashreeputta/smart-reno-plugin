import { type InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900",
        className
      )}
      {...props}
    />
  )
);
export default Input;
