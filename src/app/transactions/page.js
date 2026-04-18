"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useFinance } from "@/lib/FinanceContext";
import { CATEGORIES } from "@/lib/categories";
import { formatAED, isInSameMonth, sumTransactions } from "@/lib/finance";
import { detectAnomalies } from "@/lib/anomalyDetector";
import { Button, Card, CardBody, CardHeader, CategoryBadge, Input, Pill, Select, Textarea } from "@/components/ui";

function isValidISODate(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, monthlyIncome } = useFinance();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterCategory, setFilterCategory] = useState("All");
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const isSelectedMonthCurrent = useMemo(() => {
    const now = new Date();
    return (
      selectedMonth.getFullYear() === now.getFullYear() && selectedMonth.getMonth() === now.getMonth()
    );
  }, [selectedMonth]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(selectedMonth);
  }, [selectedMonth]);

  const monthTransactions = useMemo(() => {
    const base = transactions || [];
    return base.filter((t) => isInSameMonth(t.date, selectedMonth));
  }, [transactions, selectedMonth]);

  const availableCategories = useMemo(() => {
    const set = new Set();
    for (const t of monthTransactions) {
      if (!t?.category) continue;
      set.add(t.category);
    }
    return CATEGORIES.filter((c) => set.has(c));
  }, [monthTransactions]);

  const filtered = useMemo(() => {
    const base = monthTransactions || [];
    if (filterCategory === "All") return base;
    return base.filter((t) => t.category === filterCategory);
  }, [monthTransactions, filterCategory]);

  useEffect(() => {
    if (filterCategory === "All") return;
    if (!availableCategories.includes(filterCategory)) setFilterCategory("All");
  }, [availableCategories, filterCategory]);

  const monthlySpent = useMemo(() => {
    return (filtered || []).reduce((acc, t) => {
      if (!t || t.type !== "expense") return acc;
      const n = Number(t.amount);
      return Number.isFinite(n) ? acc + n : acc;
    }, 0);
  }, [filtered]);

  const monthlyIncomeTotal = useMemo(() => {
    const fromTx = sumTransactions(monthTransactions, { type: "income" });
    return fromTx || Number(monthlyIncome || 0);
  }, [monthTransactions, monthlyIncome]);

  const anomalyByTransactionId = useMemo(() => {
    const list = detectAnomalies(transactions);
    const map = new Map();
    for (const a of list) {
      if (a.type !== "high_transaction") continue;
      if (!a.transactionId) continue;
      map.set(a.transactionId, a);
    }
    return map;
  }, [transactions]);

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return setError("Enter a valid amount in AED (greater than 0).");
    if (!CATEGORIES.includes(category)) return setError("Pick a valid category.");
    if (!description.trim()) return setError("Add a short description (e.g., Carrefour groceries).");
    if (!isValidISODate(date)) return setError("Pick a valid date.");

    addTransaction({
      type,
      amount: n,
      category,
      description: description.trim(),
      date,
    });
    setAmount("");
    setDescription("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-gray-800">Transactions</div>
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
            className="h-10 w-10 rounded-2xl border border-pink-100 grid place-items-center text-pink-400 hover:bg-pink-50 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-2 text-sm font-medium text-gray-800">{monthLabel}</div>
          <button
            type="button"
            onClick={() =>
              setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
            disabled={isSelectedMonthCurrent}
            className="h-10 w-10 rounded-2xl border border-pink-100 grid place-items-center text-pink-400 hover:bg-pink-50 transition disabled:opacity-40 disabled:hover:bg-white"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-1">
          <CardHeader title="Add transaction" />
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <div className="text-xs font-medium text-gray-400">Type</div>
                  <Select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </Select>
                </label>
                <label className="space-y-1">
                  <div className="text-xs font-medium text-gray-400">Amount</div>
                  <Input
                    inputMode="decimal"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 42.50"
                  />
                </label>
              </div>

              <label className="space-y-1">
                <div className="text-xs font-medium text-gray-400">Category</div>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="space-y-1">
                <div className="text-xs font-medium text-gray-400">Description</div>
                <Textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Carrefour groceries, Uber to DIFC, DEWA bill…"
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs font-medium text-gray-400">Date</div>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>

              {error ? <div className="text-sm text-rose-700">{error}</div> : null}

              <Button type="submit" className="w-full">
                Add Transaction
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="This month"
            right={
              <div className="flex items-center gap-2">
                <Pill className="bg-white text-gray-500 ring-pink-100">
                  <span className="font-semibold text-gray-800">{formatAED(monthlyIncomeTotal)}</span>
                </Pill>
                <Pill className="bg-white text-gray-500 ring-pink-100">
                  <span className="font-semibold text-gray-800">{formatAED(monthlySpent)}</span>
                </Pill>
              </div>
            }
          />
          <CardBody>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setFilterCategory("All")}
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition",
                  filterCategory === "All"
                    ? "bg-pink-400 text-white border-pink-400"
                    : "bg-white text-pink-500 border-pink-200 hover:bg-pink-50",
                ].join(" ")}
              >
                All
              </button>
              {availableCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilterCategory(c)}
                  className={[
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition",
                    filterCategory === c
                      ? "bg-pink-400 text-white border-pink-400"
                      : "bg-white text-pink-500 border-pink-200 hover:bg-pink-50",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-pink-100 bg-white p-10 text-center text-gray-400">
                  —
                </div>
              ) : (
                <div className="rounded-2xl border border-pink-100 overflow-hidden bg-white shadow-sm">
                  {filtered.map((t) => (
                    <div key={t.id} className="px-5 py-5 flex items-start justify-between gap-4 border-b border-pink-100 last:border-b-0">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CategoryBadge category={t.category} />
                          <Pill className="bg-white text-gray-400 ring-pink-100">{t.date}</Pill>
                          <Pill
                            className={
                              t.type === "income"
                                ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                                : "bg-red-100 text-red-600 ring-red-200"
                            }
                          >
                            {t.type}
                          </Pill>
                        </div>
                        <div className="mt-2 text-sm font-medium text-gray-800 truncate">{t.description}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-gray-800">
                          {t.type === "income" ? "+" : "-"}
                          {formatAED(t.amount)}
                        </div>
                        {anomalyByTransactionId.has(t.id) ? (
                          <span
                            title={anomalyByTransactionId.get(t.id)?.message || "Unusual spending detected"}
                            className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200"
                          >
                            unusual
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => deleteTransaction(t.id)}
                          className="h-10 w-10 rounded-2xl border border-pink-100 grid place-items-center text-gray-400 hover:bg-pink-50 hover:text-gray-700 transition"
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

