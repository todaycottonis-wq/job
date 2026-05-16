"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { BackButton } from "./ui/back-button";

const SIDEBAR_EXCLUDED = [
  "/login",
  "/admin",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
];

// 뒤로가기 버튼을 숨길 경로 (사이드바가 있는 상위 페이지들은 굳이 필요 없음)
const BACK_HIDDEN_PREFIXES = [
  "/", // 루트(대시보드)에선 갈 곳이 없음
];

const BACK_HIDDEN_EXACT_TOP_LEVEL = new Set([
  "/applications",
  "/documents",
  "/essays",
  "/ai",
  "/help",
  "/settings",
]);

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const hideSidebar = SIDEBAR_EXCLUDED.some(
    (p) => pathname === p || pathname?.startsWith(p + "/")
  );

  if (hideSidebar) {
    return <>{children}</>;
  }

  // 사이드바에서 직접 닿는 1depth 페이지는 뒤로가기 불필요 (사이드바로 충분)
  const showBack =
    !BACK_HIDDEN_PREFIXES.includes(pathname) &&
    !BACK_HIDDEN_EXACT_TOP_LEVEL.has(pathname);

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {showBack && (
          <div className="px-5 sm:px-6 pt-4 pl-14 md:pl-6">
            <BackButton />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
