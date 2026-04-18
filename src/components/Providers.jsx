"use client";

import { FinanceProvider } from "@/lib/FinanceContext";

export default function Providers({ children }) {
  return <FinanceProvider>{children}</FinanceProvider>;
}

