"use client";

import { useEffect, useState } from "react";
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
  Menu,
  X,
  Settings,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard, badge: null },
  { href: "/calendar", label: "캘린더", icon: Calendar, badge: null },
  { href: "/applications", label: "지원현황", icon: Briefcase, badge: null },
  { href: "/documents", label: "문서함", icon: FileText, badge: null },
  {
    href: "/ai",
    label: "AI 피드백",
    icon: Sparkles,
    badge: "출시 예정",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 shadow-sm"
        aria-label="메뉴 열기"
      >
        <Menu size={18} />
      </button>

      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-label="메뉴 닫기"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex h-full w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-base font-semibold tracking-tight">
            Career up
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="md:hidden rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="메뉴 닫기"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
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
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.5">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 space-y-0.5">
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname?.startsWith("/settings")
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-50"
            }`}
          >
            <Settings size={16} strokeWidth={1.75} />
            환경설정
          </Link>
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
    </>
  );
}
