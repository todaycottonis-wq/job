"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * 사이트 전반에 깔리는 작은 뒤로가기 버튼.
 *
 * - 루트("/") 와 인증/약관 등 특정 경로에서는 숨김
 * - 클릭 시 브라우저 history.back() 시도 → 첫 진입(직링크)이라 history가 없으면 부모 경로로 fallback
 * - 사이드바 모바일 메뉴 버튼이 좌상단(top-3 left-3)에 떠있으므로 살짝 비켜서 배치
 */

const EXCLUDED_EXACT = new Set<string>([
  "/",
  "/login",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
]);

function parentPath(p: string): string {
  const trimmed = p.replace(/\/+$/, "");
  const idx = trimmed.lastIndexOf("/");
  if (idx <= 0) return "/";
  return trimmed.slice(0, idx);
}

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname() || "/";

  if (EXCLUDED_EXACT.has(pathname)) return null;

  function handleClick() {
    // history.length 가 1이면 이 탭의 첫 페이지 = 직링크 진입. 부모로 보냄.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(parentPath(pathname));
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="뒤로 가기"
      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
    >
      <ArrowLeft size={11} />
      뒤로
    </button>
  );
}
