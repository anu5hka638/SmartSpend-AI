"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinance } from "@/lib/FinanceContext";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/categories";
import {
  dailySpendingThisMonth,
  formatAED,
  spendingByCategory,
  sumTransactions,
} from "@/lib/finance";
import { detectAnomalies } from "@/lib/anomalyDetector";
import { Card, CardBody, CardHeader, Pill } from "@/components/ui";
import { AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, RotateCw, Sparkles } from "lucide-react";

function CategoryColorDot({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function DashboardCategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-pink-100 bg-white">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-gray-700">{category}</span>
    </span>
  );
}

export default function Page() {
  const {
    hydrated,
    transactions,
    monthlyIncome,
    budgetGoals,
    dashboardInsight,
    setDashboardInsight,
    insightLoading,
    setInsightLoading,
  } = useFinance();

  const monthSpent = useMemo(
    () => sumTransactions(transactions, { type: "expense", inMonthOf: new Date() }),
    [transactions],
  );

  const remaining = useMemo(() => Number(monthlyIncome || 0) - monthSpent, [monthlyIncome, monthSpent]);
  const savingsRate = useMemo(() => {
    const inc = Number(monthlyIncome || 0);
    if (!inc) return 0;
    return Math.max(0, Math.min(1, remaining / inc));
  }, [monthlyIncome, remaining]);

  const pieData = useMemo(() => {
    const totals = spendingByCategory(transactions, { inMonthOf: new Date() });
    return CATEGORIES.map((c) => ({ name: c, value: Number((totals[c] || 0).toFixed(2)) })).filter(
      (d) => d.value > 0,
    );
  }, [transactions]);

  const pieChartData = useMemo(
    () => (pieData.length ? pieData : [{ name: "No data", value: 1 }]),
    [pieData],
  );

  const lineData = useMemo(() => dailySpendingThisMonth(transactions, new Date()), [transactions]);

  const recent = useMemo(() => (transactions || []).slice(0, 5), [transactions]);
  const anomalies = useMemo(() => detectAnomalies(transactions), [transactions]);

  useEffect(() => {
    if (!hydrated) return;
    if (dashboardInsight || insightLoading) return;
    let cancelled = false;

    async function run() {
      setInsightLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content:
                  "Give a 2–3 sentence personalized insight about my spending this month in AED. Be specific (mention categories + amounts) and include one practical action I can take today in Dubai/UAE context.",
              },
            ],
            context: { transactions, monthlyIncome, budgetGoals },
            mode: "insight",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Insight request failed.");
        const text = typeof data?.reply === "string" ? data.reply.trim() : "";
        if (!cancelled) setDashboardInsight(text || "");
      } catch {
        if (!cancelled) setDashboardInsight("");
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    dashboardInsight,
    insightLoading,
    transactions,
    monthlyIncome,
    budgetGoals,
    setDashboardInsight,
    setInsightLoading,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-gray-800">Dashboard</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardBody className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-gray-400">Total Income</div>
                <div className="mt-1 text-2xl font-semibold">{formatAED(monthlyIncome)}</div>
              </div>
              <span className="h-3 w-3 rounded-full bg-emerald-400 mt-1" aria-hidden="true" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-gray-400">Total Spent</div>
                <div className="mt-1 text-2xl font-semibold">{formatAED(monthSpent)}</div>
              </div>
              <span className="h-3 w-3 rounded-full bg-red-400 mt-1" aria-hidden="true" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-gray-400">Remaining</div>
                <div className="mt-1 text-2xl font-semibold">{formatAED(remaining)}</div>
              </div>
              <span className="h-3 w-3 rounded-full bg-pink-300 mt-1" aria-hidden="true" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-gray-400">Savings Rate</div>
                <div className="mt-1 text-2xl font-semibold">{Math.round(savingsRate * 100)}%</div>
              </div>
              <span className="h-3 w-3 rounded-full bg-emerald-400 mt-1" aria-hidden="true" />
            </div>
          </CardBody>
        </Card>
      </div>

      {anomalies.length ? (
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-3">
                <span>Smart Alerts</span>
              </span>
            }
          />
          <CardBody>
            <div className="space-y-3">
              {anomalies.map((a, idx) => {
                const critical = a.severity === "critical";
                return (
                  <div
                    key={`${a.type}-${a.category}-${idx}`}
                    className={[
                      "rounded-2xl border p-4 sm:p-5 flex items-start justify-between gap-4",
                      critical
                        ? "border-red-200 bg-red-50"
                        : "border-amber-200 bg-amber-50",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <DashboardCategoryBadge category={a.category} />
                        <Pill
                          className={
                            critical
                              ? "bg-red-100 text-red-600 ring-red-200"
                              : "bg-amber-100 text-amber-700 ring-amber-200"
                          }
                        >
                          {critical ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {critical ? "Critical" : "Warning"}
                        </Pill>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 leading-6">{a.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-1">
          <CardHeader title="Spending by category" />
          <CardBody>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={64}
                    outerRadius={92}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {pieChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatAED(v)}
                    contentStyle={{ borderRadius: 12, borderColor: "#fce7f3" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              {pieData.slice(0, 6).map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 inline-flex items-center gap-2">
                    <CategoryColorDot category={d.name} />
                    <span className="truncate">{d.name}</span>
                  </span>
                  <span className="font-semibold text-gray-800">{formatAED(d.value)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Daily spending" />
          <CardBody>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#fce7f3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(iso) => String(iso).slice(-2)}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    stroke="#fbcfe8"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    stroke="#fbcfe8"
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    formatter={(v) => formatAED(v)}
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={{ borderRadius: 12, borderColor: "#fce7f3" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#f472b6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 bg-pink-50 border-pink-100 shadow-sm">
          <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
            <div className="text-sm font-semibold text-gray-800 inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              Insight
            </div>
            <button
              type="button"
              onClick={() => {
                setDashboardInsight("");
                if (typeof window !== "undefined") window.localStorage.removeItem("smartspend_insight");
              }}
              className="h-8 w-8 rounded-full grid place-items-center text-pink-400 hover:bg-pink-100/60 transition disabled:opacity-40"
              disabled={insightLoading}
              aria-label="Refresh insight"
            >
              <RotateCw className={["h-4 w-4", insightLoading ? "animate-spin" : ""].join(" ")} />
            </button>
          </div>
          <CardBody className="border-l-4 border-pink-400 ml-5 pl-4">
            {insightLoading && !dashboardInsight ? (
              <div className="text-sm text-gray-500">Thinking…</div>
            ) : (
              <div className="text-sm leading-6 text-gray-700">{dashboardInsight}</div>
            )}
          </CardBody>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader title="Recent transactions" />
          <CardBody>
            {recent.length === 0 ? (
              <div className="text-sm text-gray-400">—</div>
            ) : (
              <div className="divide-y divide-pink-100">
                {recent.map((t) => (
                  <div key={t.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <DashboardCategoryBadge category={t.category} />
                      <div className="text-sm font-medium text-gray-800 truncate">{t.description}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{formatAED(t.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
