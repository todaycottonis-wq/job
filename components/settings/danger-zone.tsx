"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, RotateCcw, Trash2, X } from "lucide-react";
import { resetAllData, deleteAccount } from "@/app/actions/settings";

type Mode = null | "reset" | "delete";

const CONFIRM_TEXTS: Record<Exclude<Mode, null>, string> = {
  reset: "초기화",
  delete: "계정 삭제",
};

export function DangerZone() {
  const [mode, setMode] = useState<Mode>(null);
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  function open(m: Mode) {
    setMode(m);
    setConfirm("");
  }
  function close() {
    if (pending) return;
    setMode(null);
  }
  function execute() {
    if (mode === "reset") {
      startTransition(() => {
        void resetAllData();
      });
    } else if (mode === "delete") {
      startTransition(() => {
        void deleteAccount();
      });
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10 p-5">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-red-600" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            위험 영역
          </p>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mb-4">
          되돌릴 수 없는 동작입니다. 신중하게 진행하세요.
        </p>

        <div className="space-y-2">
          <Row
            title="내 데이터 초기화"
            desc="지원·일정·문서·폴더를 모두 삭제합니다. 계정은 유지돼요."
            action={
              <button
                type="button"
                onClick={() => open("reset")}
                className="inline-flex items-center gap-1 rounded-lg border border-red-300 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <RotateCcw size={12} />
                초기화
              </button>
            }
          />
          <Row
            title="계정 삭제"
            desc="모든 데이터와 계정을 영구 삭제합니다. 같은 이메일로 다시 가입할 수는 있어요."
            action={
              <button
                type="button"
                onClick={() => open("delete")}
                className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <Trash2 size={12} />
                계정 삭제
              </button>
            }
          />
        </div>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-red-600">
                {mode === "reset" ? "내 데이터 초기화" : "계정 삭제"}
              </h2>
              <button
                onClick={close}
                disabled={pending}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {mode === "reset" ? (
                  <>
                    지원, 일정, 문서, 폴더가 <strong>모두 삭제</strong>됩니다.
                    <br />이 동작은 되돌릴 수 없습니다.
                  </>
                ) : (
                  <>
                    계정과 모든 데이터가 <strong>영구 삭제</strong>됩니다.
                    <br />이 동작은 되돌릴 수 없습니다.
                  </>
                )}
              </p>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  확인을 위해 <span className="font-mono text-red-600">{CONFIRM_TEXTS[mode]}</span> 라고 입력해주세요
                </label>
                <input
                  type="text"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={CONFIRM_TEXTS[mode]}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={execute}
                  disabled={pending || confirm !== CONFIRM_TEXTS[mode]}
                  className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {pending
                    ? "처리 중..."
                    : mode === "reset"
                    ? "초기화 실행"
                    : "영구 삭제"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 px-3.5 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  );
}
