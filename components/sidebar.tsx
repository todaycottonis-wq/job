"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  FileText,
  Sparkles,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/calendar", label: "캘린더", icon: Calendar },
  { href: "/applications", label: "지원현황", icon: Briefcase },
  { href: "/documents", label: "문서함", icon: FileText },
  { href: "/ai", label: "AI 피드백", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-14 items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-base font-semibold tracking-tight">JobTrack</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-50"
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 space-y-0.5">
        <Link
          href="/help"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/help"
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-50"
          }`}
        >
          <HelpCircle size={16} strokeWidth={1.75} />
          도움말
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-50"
          >
            <LogOut size={16} strokeWidth={1.75} />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
