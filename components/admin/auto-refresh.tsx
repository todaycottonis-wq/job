"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * 관리자 대시보드를 일정 주기로 자동 새로고침.
 *
 * 동작:
 *  - 15초마다 router.refresh() → 서버 컴포넌트가 다시 fetch (RSC stream)
 *  - 탭이 hidden 상태면 폴링 정지 (배터리/quota 절약)
 *  - 탭 재포커스 시 즉시 한 번 새로고침 후 재개
 *  - 우상단 "지금 새로고침" 버튼으로 수동 갱신 가능
 *
 * 트레이드오프: 15초마다 Supabase 쿼리 8개 정도 — admin 1명 + visibility-gated
 * 라서 무료 plan에서도 부담 거의 없음. 더 잦게 원하면 INTERVAL 줄이세요.
 */
const INTERVAL_MS = 15_000;
const TICK_MS = 5_000; // 표시 라벨 갱신 주기

export function AdminAutoRefresh() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const [pending, setPending] = useState(false);

  const refresh = useCallback(() => {
    setPending(true);
    router.refresh();
    setLastRefresh(Date.now());
    // RSC payload가 도착하면 자연스럽게 컴포넌트가 리렌더되지만,
    // router.refresh 자체엔 await/콜백이 없어서 임의로 짧게 표시
    setTimeout(() => setPending(false), 600);
  }, [router]);

  // 자동 새로고침 폴링
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (timer) return;
      timer = setInterval(() => {
        if (document.visibilityState === "visible") {
          refresh();
        }
      }, INTERVAL_MS);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        // 백그라운드에 있던 동안 쌓인 이벤트 한 번에 가져오기
        refresh();
        start();
      } else {
        stop();
      }
    }

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  // 상대 시간 라벨 갱신용 tick
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(t);
  }, []);

  const elapsedSec = Math.floor((now - lastRefresh) / 1000);
  const label =
    elapsedSec < 5
      ? "방금 전 갱신"
      : elapsedSec < 60
      ? `${elapsedSec}초 전 갱신`
      : `${Math.floor(elapsedSec / 60)}분 전 갱신`;

  return (
    <div className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          pending ? "bg-amber-400 animate-pulse" : "bg-green-500"
        }`}
        aria-hidden
      />
      <span>{pending ? "갱신 중..." : label}</span>
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        title="지금 새로고침"
      >
        <RefreshCw
          size={11}
          className={pending ? "animate-spin" : undefined}
        />
        지금
      </button>
    </div>
  );
}
