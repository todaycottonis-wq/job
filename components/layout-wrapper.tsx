"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

const SIDEBAR_EXCLUDED = [
  "/login",
  "/admin",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = SIDEBAR_EXCLUDED.some(
    (p) => pathname === p || pathname?.startsWith(p + "/")
  );

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
