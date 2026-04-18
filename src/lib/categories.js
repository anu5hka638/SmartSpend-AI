export const CATEGORIES = [
  "Food & Dining",
  "Rent",
  "Transport",
  "Subscriptions",
  "Remittance",
  "Shopping",
  "Healthcare",
  "Entertainment",
  "Other",
];

export const CATEGORY_COLORS = {
  "Food & Dining": "#f97316",
  Rent: "#8b5cf6",
  Transport: "#3b82f6",
  Subscriptions: "#ec4899",
  Remittance: "#f59e0b",
  Shopping: "#ef4444",
  Healthcare: "#10b981",
  Entertainment: "#06b6d4",
  Other: "#6b7280",
};

export const CATEGORY_STYLES = {
  "Food & Dining": "bg-amber-500/15 text-amber-700 ring-amber-500/20",
  Rent: "bg-indigo-500/15 text-indigo-700 ring-indigo-500/20",
  Transport: "bg-sky-500/15 text-sky-700 ring-sky-500/20",
  Subscriptions: "bg-fuchsia-500/15 text-fuchsia-700 ring-fuchsia-500/20",
  Remittance: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20",
  Shopping: "bg-rose-500/15 text-rose-700 ring-rose-500/20",
  Healthcare: "bg-teal-500/15 text-teal-700 ring-teal-500/20",
  Entertainment: "bg-violet-500/15 text-violet-700 ring-violet-500/20",
  Other: "bg-slate-500/15 text-slate-700 ring-slate-500/20",
};

export function categoryClassName(category) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;
}

