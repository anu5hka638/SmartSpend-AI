import { CATEGORIES } from "./categories";
import { formatAED, isInSameMonth } from "./finance";

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function detectAnomalies(transactions) {
  const txs = Array.isArray(transactions) ? transactions : [];

  // Only treat expenses as "spending anomalies".
  const expenses = txs.filter((t) => t && t.type === "expense" && Number.isFinite(Number(t.amount)));

  const byCategory = new Map();
  for (const t of expenses) {
    const cat = CATEGORIES.includes(t.category) ? t.category : "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push({ ...t, category: cat, amount: Number(t.amount) });
  }

  const anomalies = [];

  // High transaction vs category average
  for (const [category, items] of byCategory.entries()) {
    if (!items.length) continue;
    const avg = items.reduce((a, t) => a + t.amount, 0) / items.length;
    if (!avg || !Number.isFinite(avg)) continue;

    for (const t of items) {
      if (t.amount > 2 * avg) {
        const multiple = avg > 0 ? t.amount / avg : 0;
        const severity = multiple >= 3 ? "critical" : "warning";
        anomalies.push({
          type: "high_transaction",
          category,
          amount: round2(t.amount),
          message: `Your ${category} expense of ${formatAED(t.amount)} is ${multiple.toFixed(1)}x your usual ${formatAED(avg)} average for this category`,
          severity,
          transactionId: t.id,
        });
      }
    }
  }

  // High category share this month
  const now = new Date();
  const monthExpenses = expenses.filter((t) => isInSameMonth(t.date, now));
  const totalMonthSpending = monthExpenses.reduce((a, t) => a + Number(t.amount), 0);
  if (totalMonthSpending > 0) {
    const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    for (const t of monthExpenses) {
      const cat = CATEGORIES.includes(t.category) ? t.category : "Other";
      totals[cat] += Number(t.amount);
    }

    for (const c of CATEGORIES) {
      const share = totals[c] / totalMonthSpending;
      if (share > 0.4 && totals[c] > 0) {
        const pct = Math.round(share * 100);
        anomalies.push({
          type: "high_category_share",
          category: c,
          amount: round2(totals[c]),
          message: `${c} makes up ${pct}% of your total spending this month`,
          severity: share >= 0.55 ? "critical" : "warning",
        });
      }
    }
  }

  return anomalies;
}

