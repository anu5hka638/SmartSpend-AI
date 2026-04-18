"use client";

import { useMemo } from "react";
import { useFinance } from "@/lib/FinanceContext";
import { CATEGORIES } from "@/lib/categories";
import { formatAED, spendingByCategory } from "@/lib/finance";
import { Button, Card, CardBody, CardHeader, Input, Progress } from "@/components/ui";

function intentForRatio(r) {
  if (r >= 0.9) return "bad";
  if (r >= 0.7) return "warn";
  return "good";
}

export default function BudgetPage() {
  const { transactions, budgetGoals, setBudgetGoal, resetToSample } = useFinance();

  const spent = useMemo(() => spendingByCategory(transactions, { inMonthOf: new Date() }), [transactions]);

  const rows = useMemo(() => {
    return CATEGORIES.map((c) => {
      const limit = Number(budgetGoals?.[c] || 0);
      const s = Number(spent?.[c] || 0);
      const ratio = limit > 0 ? s / limit : 0;
      const pct = limit > 0 ? Math.min(100, Math.round(ratio * 100)) : 0;
      const intent = intentForRatio(ratio);
      const remaining = limit - s;
      const warn = limit > 0 && ratio >= 0.7;
      return { category: c, limit, spent: s, ratio, pct, intent, remaining, warn };
    });
  }, [budgetGoals, spent]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-gray-800">Budget Goals</div>
        </div>
        <Button variant="ghost" onClick={resetToSample}>
          Reset sample data
        </Button>
      </div>

      <Card>
        <CardHeader title="Budgets" />
        <CardBody>
          <div className="space-y-4">
            {rows.map((r) => (
              <div
                key={r.category}
                className="rounded-2xl border border-pink-100 p-5 bg-white shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{r.category}</div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-semibold text-gray-800">{formatAED(r.spent)}</span>
                      {" / "}
                      <span className="font-semibold text-gray-800">{formatAED(r.limit)}</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-64">
                    <Input
                      inputMode="decimal"
                      type="number"
                      step="0.01"
                      value={r.limit}
                      onChange={(e) => setBudgetGoal(r.category, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Progress value={r.pct} intent={r.intent} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

