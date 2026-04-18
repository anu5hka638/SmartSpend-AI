"use client";

import { CATEGORY_COLORS, categoryClassName } from "@/lib/categories";

export function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-pink-100 bg-white shadow-sm",
        "transition hover:-translate-y-[1px] hover:shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-gray-800">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-gray-400">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={["px-5 pb-5", className].join(" ")}>{children}</div>;
}

export function Pill({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <Pill className={[categoryClassName(category), "gap-2"].join(" ")}>
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {category}
    </Pill>
  );
}

export function Button({ className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-pink-50 text-gray-800"
      : variant === "soft"
        ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
        : "bg-pink-400 text-white hover:bg-pink-500";
  return <button className={[base, styles, className].join(" ")} {...props} />;
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "w-full rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400",
        "outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-300/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function Select({ className = "", ...props }) {
  return (
    <select
      className={[
        "w-full rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-gray-800",
        "outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-300/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={[
        "w-full rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400",
        "outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-300/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function Progress({ value, intent = "good" }) {
  const bar =
    intent === "bad"
      ? "bg-red-400"
      : intent === "warn"
        ? "bg-amber-400"
        : "bg-gradient-to-r from-pink-400 to-pink-300";
  return (
    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className={["h-full rounded-full", bar].join(" ")} style={{ width: `${value}%` }} />
    </div>
  );
}

