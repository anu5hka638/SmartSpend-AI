"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Gauge, PiggyBank, ReceiptText } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/budget", label: "Budget Goals", icon: PiggyBank },
  { href: "/chat", label: "AI Advisor", icon: Bot },
];

function NavItem({ href, label, icon: Icon, active }) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-pink-50 text-pink-500"
          : "text-gray-500 hover:text-gray-800 hover:bg-pink-50/50",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-9 w-9 place-items-center rounded-2xl transition",
          active
            ? "bg-pink-200 text-pink-500"
            : "bg-white text-gray-400 group-hover:bg-white",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, label, icon: Icon, active }) {
  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition",
        active ? "text-pink-500" : "text-gray-400 hover:text-gray-700",
      ].join(" ")}
    >
      <Icon className={active ? "h-5 w-5" : "h-5 w-5 opacity-90"} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname() || "/";

  return (
    <div className="min-h-dvh bg-[#fdf6f9] text-gray-800">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex min-h-dvh">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex w-[280px] shrink-0 flex-col bg-white border-r border-pink-100">
            <div className="px-5 pt-6 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-400 grid place-items-center text-white font-extrabold">
                  S
                </div>
                <div>
                  <div className="text-base font-semibold tracking-tight text-gray-800">SmartSpend AI</div>
                </div>
              </div>
            </div>
            <nav className="px-4 py-3 space-y-1">
              {NAV.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
                />
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <header className="sticky top-0 z-20 border-b border-pink-100 bg-white/80 backdrop-blur">
              <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="md:hidden flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-pink-400 grid place-items-center text-white font-extrabold">
                    S
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-gray-800">SmartSpend AI</div>
                  </div>
                </div>
                <div className="hidden md:block" />
              </div>
            </header>

            <main className="px-4 sm:px-6 py-6 pb-24 md:pb-8">{children}</main>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-pink-100 bg-white">
        <div className="mx-auto max-w-[1400px] grid grid-cols-4">
          {NAV.map((item) => (
            <MobileNavItem
              key={item.href}
              {...item}
              active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

