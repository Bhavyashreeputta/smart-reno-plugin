import clsx from "clsx";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("bg-white rounded-2xl shadow-sm border border-slate-200", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("px-5 pt-5 pb-3 font-semibold text-slate-700", className)} {...props} />;
}
export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("px-5 pb-5", className)} {...props} />;
}