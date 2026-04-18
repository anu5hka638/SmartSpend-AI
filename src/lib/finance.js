import { CATEGORIES } from "./categories";

export function formatAED(value) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `AED ${safe.toFixed(2)}`;
}

export function monthKey(d = new Date()) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function toISODate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isInSameMonth(isoDate, refDate = new Date()) {
  if (!isoDate) return false;
  const dt = new Date(`${isoDate}T00:00:00`);
  return dt.getFullYear() === refDate.getFullYear() && dt.getMonth() === refDate.getMonth();
}

export function sumTransactions(transactions, { type, inMonthOf } = {}) {
  const ref = inMonthOf || new Date();
  return (transactions || []).reduce((acc, t) => {
    if (!t) return acc;
    if (type && t.type !== type) return acc;
    if (inMonthOf && !isInSameMonth(t.date, ref)) return acc;
    const amt = Number(t.amount);
    if (!Number.isFinite(amt)) return acc;
    return acc + amt;
  }, 0);
}

export function spendingByCategory(transactions, { inMonthOf } = {}) {
  const ref = inMonthOf || new Date();
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  for (const t of transactions || []) {
    if (!t || t.type !== "expense") continue;
    if (inMonthOf && !isInSameMonth(t.date, ref)) continue;
    const amt = Number(t.amount);
    if (!Number.isFinite(amt) || amt <= 0) continue;
    const key = CATEGORIES.includes(t.category) ? t.category : "Other";
    totals[key] += amt;
  }
  return totals;
}

export function dailySpendingThisMonth(transactions, refDate = new Date()) {
  const y = refDate.getFullYear();
  const m = refDate.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const map = new Map();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toISODate(new Date(y, m, day));
    map.set(iso, 0);
  }

  for (const t of transactions || []) {
    if (!t || t.type !== "expense") continue;
    if (!isInSameMonth(t.date, refDate)) continue;
    const amt = Number(t.amount);
    if (!Number.isFinite(amt) || amt <= 0) continue;
    if (!map.has(t.date)) map.set(t.date, 0);
    map.set(t.date, map.get(t.date) + amt);
  }

  return Array.from(map.entries()).map(([date, amount]) => ({
    date,
    amount: Number(amount.toFixed(2)),
  }));
}

export function makeSampleData(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (day) => toISODate(new Date(y, m, day));

  const transactions = [
    { id: "t1", type: "income", amount: 8500, category: "Other", description: "Salary — Dubai", date: d(1) },
    { id: "t2", type: "expense", amount: 3250, category: "Rent", description: "Room rent — Al Barsha (shared)", date: d(2) },
    { id: "t3", type: "expense", amount: 420, category: "Subscriptions", description: "du Home Internet", date: d(3) },
    { id: "t4", type: "expense", amount: 260, category: "Transport", description: "Uber rides (work + errands)", date: d(4) },
    { id: "t5", type: "expense", amount: 615.5, category: "Food & Dining", description: "Carrefour groceries", date: d(5) },
    { id: "t6", type: "expense", amount: 185.75, category: "Food & Dining", description: "Talabat lunch + coffee", date: d(6) },
    { id: "t7", type: "expense", amount: 110, category: "Transport", description: "NOL top-up + Metro", date: d(7) },
    { id: "t8", type: "expense", amount: 380, category: "Utilities", description: "DEWA (electricity/water)", date: d(8) },
    { id: "t9", type: "expense", amount: 210, category: "Subscriptions", description: "Netflix + Spotify", date: d(9) },
    { id: "t10", type: "expense", amount: 290, category: "Shopping", description: "H&M basics", date: d(10) },
    { id: "t11", type: "expense", amount: 95, category: "Entertainment", description: "Cinema at Mall of the Emirates", date: d(11) },
    { id: "t12", type: "expense", amount: 160, category: "Healthcare", description: "Pharmacy + vitamins", date: d(12) },
    { id: "t13", type: "expense", amount: 540, category: "Remittance", description: "Transfer to family (Wise)", date: d(14) },
    { id: "t14", type: "expense", amount: 205.25, category: "Food & Dining", description: "Dinner — shawarma + drinks", date: d(15) },
    { id: "t15", type: "expense", amount: 145, category: "Transport", description: "Careem", date: d(16) },
    { id: "t16", type: "expense", amount: 330.9, category: "Shopping", description: "Noon order (household)", date: d(17) },
  ].map((t) => ({
    ...t,
    category: CATEGORIES.includes(t.category) ? t.category : "Other",
  }));

  const budgetGoals = {
    "Food & Dining": 1200,
    Rent: 3400,
    Transport: 450,
    Subscriptions: 300,
    Remittance: 700,
    Shopping: 450,
    Healthcare: 250,
    Entertainment: 250,
    Other: 300,
  };

  return { monthlyIncome: 8500, transactions, budgetGoals };
}

