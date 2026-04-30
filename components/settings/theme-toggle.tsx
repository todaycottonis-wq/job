"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { logThemeChange } from "@/app/actions/settings";

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "라이트", icon: <Sun size={14} /> },
  { value: "dark", label: "다크", icon: <Moon size={14} /> },
  { value: "system", label: "시스템", icon: <Monitor size={14} /> },
];

function applyTheme(theme: Theme) {
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && sysDark);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
    setTheme(stored);
  }, []);

  // system 모드에서 OS 테마 변경 감지
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  function pick(t: Theme) {
    setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
    void logThemeChange(t);
  }

  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => pick(o.value)}
          className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-colors ${
            theme === o.value
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
