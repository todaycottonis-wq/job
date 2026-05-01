"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2 } from "lucide-react";
import { DDayBadge } from "@/components/ui/dday-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { NewEssayModal } from "./new-essay-modal";

interface EssayListItem {
  id: string;
  company_name: string;
  job_title: string;
  jd_url: string | null;
  applied_date: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  essay_questions: { id: string; answer: string }[];
}

function progress(qs: { answer: string }[]): { done: number; total: number; pct: number } {
  const total = qs.length;
  const done = qs.filter((q) => q.answer.trim().length > 0).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

export function EssayList() {
  const toast = useToast();
  const [essays, setEssays] = useState<EssayListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const fetchEssays = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/essays");
      const json = await res.json();
      setEssays(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEssays();
  }, [fetchEssays]);

  async function handleDelete(item: EssayListItem) {
    if (!confirm(`'${item.company_name}' 자소서를 삭제할까요? 모든 문항도 같이 사라져요.`)) return;
    await fetch(`/api/essays/${item.id}`, { method: "DELETE" });
    setEssays((prev) => prev.filter((e) => e.id !== item.id));
    toast.show("삭제했어요", { variant: "success" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold tracking-tight">자소서</h1>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1 rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] active:bg-[#1560d4] px-3 py-1.5 text-sm font-semibold text-white transition-colors"
        >
          <Plus size={14} />
          새 자소서
        </button>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        회사별 폴더 안에 문항을 모아서 한 번에 관리하세요.
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : essays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#3182F6]/10 flex items-center justify-center mb-4">
              <FileText size={20} className="text-[#3182F6]" />
            </div>
            <p className="text-base font-semibold mb-1">아직 작성한 자소서가 없어요</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
              회사별로 폴더를 만들고 문항을 추가해보세요.
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3182F6] hover:bg-[#1a6fe8] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={14} />
              첫 자소서 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {essays.map((e) => {
              const p = progress(e.essay_questions ?? []);
              return (
                <div
                  key={e.id}
                  className="group relative rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#3182F6] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all"
                >
                  <Link href={`/essays/${e.id}`} className="block p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-base font-bold tracking-tight truncate">
                        {e.company_name}
                      </p>
                      {e.deadline && <DDayBadge date={e.deadline} prefix="D" />}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-4">
                      {e.job_title}
                    </p>

                    {/* 진행률 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>
                          진행률 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{p.pct}%</span>
                        </span>
                        <span>{p.done} / {p.total} 문항</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-[#3182F6] rounded-full transition-all"
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.preventDefault();
                      handleDelete(e);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    aria-label="삭제"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNew && (
        <NewEssayModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            void fetchEssays();
          }}
        />
      )}
    </div>
  );
}
