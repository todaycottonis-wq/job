"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { ApplicationForm } from "@/components/applications/application-form";
import type { ApplicationRow, ApplicationFilter } from "@/types/application";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types/application";
import type { ApplicationStatus } from "@/types/database";

const FILTER_TABS: { label: string; value: ApplicationFilter["status"] }[] = [
  { label: "전체", value: "all" },
  { label: "위시리스트", value: "wishlist" },
  { label: "지원완료", value: "applied" },
  { label: "서류심사", value: "screening" },
  { label: "면접", value: "interview" },
  { label: "최종합격", value: "offer" },
  { label: "불합격", value: "rejected" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationFilter["status"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ApplicationRow | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/applications"
          : `/api/applications?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();
      setApplications(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  function openCreate() {
    setEditTarget(undefined);
    setShowForm(true);
  }

  function openEdit(app: ApplicationRow) {
    setEditTarget(app);
    setShowForm(true);
  }

  function handleSuccess(app: ApplicationRow) {
    setShowForm(false);
    setApplications((prev) => {
      const idx = prev.findIndex((a) => a.id === app.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = app;
        return next;
      }
      return [app, ...prev];
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("이 지원을 삭제할까요?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/applications/${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const visible =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold tracking-tight">지원현황</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          + 지원 추가
        </button>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        지원한 회사와 진행 상태를 추적하세요.
      </p>

      {/* 필터 탭 */}
      <div className="mt-4 flex gap-1 flex-wrap">
        {FILTER_TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === value
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>회사 / 직무</span>
          <span>상태</span>
          <span>지원일</span>
          <span>마감일</span>
          <span />
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-400">
            불러오는 중...
          </div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-zinc-400">
              {filter === "all"
                ? "아직 지원 내역이 없습니다."
                : `'${APPLICATION_STATUS_LABELS[filter as ApplicationStatus]}' 상태의 지원이 없습니다.`}
            </p>
            {filter === "all" && (
              <button
                onClick={openCreate}
                className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
              >
                첫 지원 추가하기 →
              </button>
            )}
          </div>
        ) : (
          <ul>
            {visible.map((app) => (
              <li
                key={app.id}
                onClick={() => openEdit(app)}
                className="group grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {app.company_name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {app.position}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                </div>
                <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                  {app.applied_at ?? "—"}
                </div>
                <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                  {app.deadline ?? "—"}
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(app.id);
                    }}
                    disabled={deletingId === app.id}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <ApplicationForm
          mode={editTarget ? "edit" : "create"}
          initial={editTarget}
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
