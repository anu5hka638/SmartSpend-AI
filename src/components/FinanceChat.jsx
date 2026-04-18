"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const QUICK_ACTIONS = [
  {
    label: "Analyze my spending",
    prompt:
      "Analyze my spending patterns and suggest safe, practical ways to reduce overspending. If you need more details, ask clarifying questions.",
  },
  {
    label: "Create a monthly budget",
    prompt:
      "Create a simple monthly budget for me. Use my income/expenses if provided; if anything is missing or unclear, ask questions before finalizing numbers.",
  },
  {
    label: "How can I save more money?",
    prompt:
      "How can I save more money? Provide beginner-friendly steps and realistic, non-judgmental targets.",
  },
];

export default function FinanceChat() {
  const [messages, setMessages] = useState([]); // [{ role: 'user'|'assistant', content: string }]
  const [input, setInput] = useState("");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom on new messages.
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendMessage(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    const assistantPlaceholder = { role: "assistant", content: "Thinking..." };

    setMessages([...nextMessages, assistantPlaceholder]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          income: income?.trim() ? income.trim() : undefined,
          expenses: expenses?.trim() ? expenses.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Request failed (${res.status}): ${errText || res.statusText}`);
      }

      const data = await res.json();
      const reply =
        typeof data?.reply === "string" && data.reply.trim().length > 0
          ? data.reply.trim()
          : "Sorry, I could not generate a response. Please try again.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: reply };
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "Sorry, something went wrong while talking to the finance assistant. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function onQuickAction(actionPrompt) {
    // Avoid reusing stale `input`.
    sendMessage(actionPrompt);
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-black/[0.06] bg-white/80 backdrop-blur dark:border-white/[0.08] dark:bg-black/60">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold tracking-tight">SpendSmartAI</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Conservative, safe, beginner-friendly money guidance.
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 flex-1 flex flex-col gap-4">
        <section className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Monthly income (optional)</div>
              <input
                inputMode="decimal"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-black/[0.25] dark:border-white/[0.12] dark:bg-black/30 dark:focus:border-white/[0.28]"
                placeholder="e.g. 4500"
              />
            </label>

            <label className="flex-1">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Monthly expenses (optional)</div>
              <input
                inputMode="decimal"
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-black/[0.25] dark:border-white/[0.12] dark:bg-black/30 dark:focus:border-white/[0.28]"
                placeholder="e.g. 3200"
              />
            </label>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                sendMessage(
                  "Using my income and expenses (if provided), summarize my current financial situation and suggest 3 safe, practical steps to improve. Ask clarifying questions if needed."
                )
              }
              className="sm:ml-2 rounded-xl bg-black text-white px-4 py-2 text-sm font-medium transition hover:bg-black/90 disabled:opacity-50"
            >
              {loading ? "..." : "Get summary"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={loading}
              onClick={() => onQuickAction(a.prompt)}
              className="rounded-xl border border-black/[0.08] bg-white/80 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50 dark:border-white/[0.12] dark:bg-white/[0.03] dark:text-zinc-50 dark:hover:bg-white/[0.06]"
            >
              {a.label}
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-black/[0.06] bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.03] flex flex-col flex-1 min-h-[420px]">
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
            aria-label="Chat messages"
          >
            {messages.length === 0 ? (
              <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Ask a question about budgeting, saving, or spending habits.
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl bg-black px-4 py-3 text-sm leading-6 text-white"
                        : "max-w-[85%] rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm leading-6 text-zinc-900 dark:border-white/[0.08] dark:bg-black/40 dark:text-zinc-50"
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}

            {loading && messages.length > 0 ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm leading-6 text-zinc-900 dark:border-white/[0.08] dark:bg-black/40 dark:text-zinc-50">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-pulse [animation-delay:120ms]" />
                    <span className="h-2 w-2 rounded-full bg-zinc-500 animate-pulse [animation-delay:240ms]" />
                    <span className="sr-only">Loading</span>
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-black/[0.06] px-4 py-4 dark:border-white/[0.08]">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about budgeting, saving, or spending habits..."
                className="flex-1 min-h-[44px] max-h-40 resize-none rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-black/[0.25] dark:border-white/[0.12] dark:bg-black/30 dark:focus:border-white/[0.28]"
              />

              <button
                type="button"
                disabled={!canSend}
                onClick={() => sendMessage(input)}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400" />
          </div>
        </section>
      </main>
    </div>
  );
}

