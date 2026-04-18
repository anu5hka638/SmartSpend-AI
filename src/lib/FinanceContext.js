"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "./categories";
import { makeSampleData } from "./finance";

const STORAGE_KEY = "smartspend_finance_v1";
const CHAT_KEY = "smartspend_chat";
const INSIGHT_KEY = "smartspend_insight";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeBudgetGoals(obj) {
  const out = {};
  for (const c of CATEGORIES) {
    const v = obj?.[c];
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) out[c] = n;
  }
  return out;
}

function normalizeTransactions(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(Boolean)
    .map((t) => {
      const amount = Number(t.amount);
      const type = t.type === "income" ? "income" : "expense";
      const category = CATEGORIES.includes(t.category) ? t.category : "Other";
      const date = typeof t.date === "string" ? t.date : "";
      const description = typeof t.description === "string" ? t.description : "";
      const id = typeof t.id === "string" && t.id ? t.id : crypto.randomUUID();
      return {
        id,
        type,
        category,
        amount: Number.isFinite(amount) ? amount : 0,
        description,
        date,
      };
    })
    .filter((t) => t.date && Number.isFinite(t.amount));
}

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(8500);
  const [budgetGoals, setBudgetGoals] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [dashboardInsight, setDashboardInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const parsed = raw ? safeParse(raw) : null;
    const seed = makeSampleData(new Date());

    const next = parsed && typeof parsed === "object" ? parsed : seed;
    setTransactions(normalizeTransactions(next.transactions || seed.transactions));
    setMonthlyIncome(Number(next.monthlyIncome) || seed.monthlyIncome || 8500);
    setBudgetGoals(normalizeBudgetGoals(next.budgetGoals || seed.budgetGoals));

    const chatRaw = typeof window !== "undefined" ? window.localStorage.getItem(CHAT_KEY) : null;
    const chatParsed = chatRaw ? safeParse(chatRaw) : null;
    setChatHistory(Array.isArray(chatParsed) ? chatParsed : []);

    const insightRaw = typeof window !== "undefined" ? window.localStorage.getItem(INSIGHT_KEY) : null;
    setDashboardInsight(typeof insightRaw === "string" ? insightRaw : "");

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload = {
      transactions,
      monthlyIncome,
      budgetGoals,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [transactions, monthlyIncome, budgetGoals, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory));
  }, [chatHistory, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(INSIGHT_KEY, dashboardInsight || "");
  }, [dashboardInsight, hydrated]);

  const actions = useMemo(() => {
    function addTransaction(tx) {
      const amount = Number(tx.amount);
      const safe = {
        id: crypto.randomUUID(),
        type: tx.type === "income" ? "income" : "expense",
        category: CATEGORIES.includes(tx.category) ? tx.category : "Other",
        amount: Number.isFinite(amount) ? amount : 0,
        description: String(tx.description || ""),
        date: String(tx.date || ""),
      };
      setTransactions((prev) => [safe, ...prev]);
    }

    function deleteTransaction(id) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }

    function setBudgetGoal(category, limit) {
      const cat = CATEGORIES.includes(category) ? category : "Other";
      const n = Number(limit);
      setBudgetGoals((prev) => ({
        ...prev,
        [cat]: Number.isFinite(n) && n >= 0 ? n : 0,
      }));
    }

    function resetToSample() {
      const seed = makeSampleData(new Date());
      setTransactions(normalizeTransactions(seed.transactions));
      setMonthlyIncome(seed.monthlyIncome || 8500);
      setBudgetGoals(normalizeBudgetGoals(seed.budgetGoals));
    }

    return { addTransaction, deleteTransaction, setMonthlyIncome, setBudgetGoal, resetToSample };
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      transactions,
      monthlyIncome,
      budgetGoals,
      chatHistory,
      setChatHistory,
      dashboardInsight,
      setDashboardInsight,
      insightLoading,
      setInsightLoading,
      ...actions,
    }),
    [
      hydrated,
      transactions,
      monthlyIncome,
      budgetGoals,
      chatHistory,
      dashboardInsight,
      insightLoading,
      actions,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}

