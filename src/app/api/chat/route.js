import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { detectAnomalies } from "@/lib/anomalyDetector";

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.trim() }));
}

function sanitizeContext(context) {
  const ctx = context && typeof context === "object" ? context : {};
  const monthlyIncome = Number(ctx.monthlyIncome);
  const transactions = Array.isArray(ctx.transactions) ? ctx.transactions : [];
  const budgetGoals = ctx.budgetGoals && typeof ctx.budgetGoals === "object" ? ctx.budgetGoals : {};
  return {
    monthlyIncome: Number.isFinite(monthlyIncome) ? monthlyIncome : 0,
    transactions: transactions.slice(0, 500),
    budgetGoals,
  };
}

function buildSystemPrompt({ mode, context }) {
  const style =
    mode === "insight"
      ? "You are SmartSpend AI, a UAE-focused personal finance advisor. Produce a short, punchy 2–3 sentence insight using AED amounts and categories. Be numbers-driven and practical."
      : "You are SmartSpend AI, a UAE-focused personal finance advisor. Be friendly, specific, and numbers-driven. Prefer practical steps and safe guidance. Avoid speculative investing advice. Use AED and UAE context (Dubai/Abu Dhabi).";

  const rules = [
    "Always use AED with 2 decimals when citing amounts.",
    "Reference the user's actual categories, totals, and budget limits.",
    "If key data is missing, ask 1–2 clarifying questions, but still give best-effort guidance.",
    "Keep answers structured: brief summary, then 3–7 bullet actions.",
  ];

  const anomalies = detectAnomalies(context?.transactions || []).map((a) => ({
    type: a.type,
    category: a.category,
    amount: a.amount,
    severity: a.severity,
    message: a.message,
  }));

  const snapshot = JSON.stringify(context, null, 2);
  return `${style}\n\nRules:\n- ${rules.join("\n- ")}\n\nDetected spending anomalies: ${JSON.stringify(anomalies)}\n\nUser financial context (JSON):\n${snapshot}\n`;
}

function extractText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((c) => (c && c.type === "text" ? c.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function POST(req) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY environment variable." },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === "insight" ? "insight" : "chat";
    const messages = sanitizeMessages(body?.messages);
    const context = sanitizeContext(body?.context);

    const client = new Anthropic({ apiKey });
    const system = buildSystemPrompt({ mode, context });

    const result = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system,
      messages: messages.length
        ? messages
        : [{ role: "user", content: "Give me a helpful overview of my spending in AED." }],
    });

    const reply = extractText(result?.content);
    const safeReply =
      typeof reply === "string" && reply.trim().length > 0
        ? reply.trim()
        : "Sorry — I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply: safeReply });
  } catch (err) {
    console.log("Claude API Error:", err?.message);
    console.log("Error details:", err);
    const msg = typeof err?.message === "string" ? err.message : "";
    return NextResponse.json(
      { error: msg || "Unexpected server error while generating a response." },
      { status: 500 },
    );
  }
}

