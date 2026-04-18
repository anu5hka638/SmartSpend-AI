"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizonal, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useFinance } from "@/lib/FinanceContext";
import { formatAED, sumTransactions } from "@/lib/finance";
import { Button, Textarea } from "@/components/ui";

const SUGGESTED = [
  "Am I overspending?",
  "How can I save AED 1,000 more this month?",
  "Which category should I cut?",
  "Give me a savings plan for AED 3,500/month",
  "How does my spending compare to a typical Dubai resident?",
];

function Bubble({ message }) {
  const isUser = message?.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[90%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6",
          isUser
            ? "bg-pink-400 text-white shadow-sm"
            : "bg-white border border-pink-100 text-gray-800 shadow-sm",
        ].join(" ")}
      >
        {isUser ? (
          message?.content
        ) : (
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <p style={{ fontWeight: 500, fontSize: "15px", marginBottom: "6px" }}>{children}</p>
              ),
              h2: ({ children }) => (
                <p style={{ fontWeight: 500, fontSize: "14px", marginBottom: "4px" }}>{children}</p>
              ),
              h3: ({ children }) => (
                <p style={{ fontWeight: 500, fontSize: "13px", marginBottom: "4px" }}>{children}</p>
              ),
              strong: ({ children }) => (
                <span style={{ fontWeight: 500, color: "var(--tw-prose-bold)" }}>{children}</span>
              ),
              ul: ({ children }) => <ul style={{ paddingLeft: "1rem", margin: "4px 0" }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ paddingLeft: "1rem", margin: "4px 0" }}>{children}</ol>,
              li: ({ children }) => <li style={{ marginBottom: "3px", fontSize: "13px" }}>{children}</li>,
              p: ({ children }) => (
                <p style={{ margin: "4px 0", fontSize: "13px", lineHeight: "1.6" }}>{children}</p>
              ),
              hr: () => (
                <hr style={{ border: "none", borderTop: "0.5px solid #fce7f3", margin: "8px 0" }} />
              ),
            }}
          >
            {message?.content || ""}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { hydrated, transactions, monthlyIncome, budgetGoals, chatHistory, setChatHistory } = useFinance();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const monthSpent = useMemo(
    () => sumTransactions(transactions, { type: "expense", inMonthOf: new Date() }),
    [transactions],
  );

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatHistory, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function send(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed || loading) return;
    setError("");
    const next = [...(chatHistory || []), { role: "user", content: trimmed }];
    setChatHistory(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m.role === "user" || m.role === "assistant").slice(-20),
          context: { transactions, monthlyIncome, budgetGoals },
          mode: "chat",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Chat request failed.");
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
      setChatHistory((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        { role: "assistant", content: reply || "Sorry — I couldn’t generate a reply." },
      ]);
    } catch (e) {
      setError("Something went wrong talking to Claude. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100dvh-88px)] md:h-[calc(100dvh-96px)] flex flex-col gap-4 overflow-hidden">
      <div className="shrink-0 flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-gray-800">AI Advisor</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="px-3 py-1.5 rounded-full text-pink-500 hover:bg-pink-50"
            onClick={() => {
              setChatHistory([]);
              if (typeof window !== "undefined") window.localStorage.removeItem("smartspend_chat");
            }}
          >
            Clear chat
          </Button>
          <div className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="h-4 w-4 text-pink-500" />
            {formatAED(monthSpent)}
          </div>
        </div>
      </div>

      <div className="shrink-0 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={!hydrated || loading}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border border-pink-200 bg-white text-pink-500 hover:bg-pink-50 transition disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden flex flex-col">
        <div
          ref={listRef}
          className="flex-1 min-h-0 overflow-y-auto bg-white px-4 sm:px-6 py-6 space-y-4"
        >
          {(chatHistory || []).map((m, idx) => (
            <Bubble key={idx} message={m} />
          ))}
          {loading ? (
            <Bubble
              message={{
                role: "assistant",
                content: "…",
              }}
            />
          ) : null}
        </div>

        <div className="shrink-0 border-t border-pink-100 bg-white px-4 sm:px-6 py-4">
          {error ? <div className="mb-2 text-sm text-red-400">{error}</div> : null}
          <div className="flex gap-2 items-end">
            <Textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=""
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              className="min-h-[44px] max-h-40 resize-none"
            />
            <Button
              type="button"
              onClick={() => send(input)}
              disabled={!canSend}
              className="h-[44px] px-4 rounded-xl"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

