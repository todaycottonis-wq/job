"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, FileText, NotebookText } from "lucide-react";
import { ApplicationForm } from "@/components/applications/application-form";
import { Skeleton } from "@/components/ui/skeleton";
import { DDayBadge } from "@/components/ui/dday-badge";
import { useToast } from "@/components/ui/toast";
import type { ApplicationRow, ApplicationFilter } from "@/types/application";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types/application";
import type { ApplicationStatus } from "@/types/database";

const FILTER_TABS: { label: string; value: ApplicationFilter["status"] }[] = [
  { label: "전체", value: "all" },
  { label: "작성중", value: "drafting" },
  { label: "지원완료", value: "applied" },
  { label: "인적성", value: "aptitude" },
  { label: "1차면접", value: "interview_1" },
  { label: "2차면접", value: "interview_2" },
  { label: "최종합격", value: "offer" },
  { label: "불합격", value: "rejected" },
];

interface AppDoc {
  id: string;
  title: string;
  type: string;
  is_link: boolean;
}

export default function ApplicationsPage() {
  const toast = useToast();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [appDocsMap, setAppDocsMap] = useState<Record<string, AppDoc[]>>({});
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
      const [appsRes, docsRes] = await Promise.all([
        fetch(url),
        fetch("/api/application-documents"),
      ]);
      const appsJson = await appsRes.json();
      const docsJson = await docsRes.json();
      setApplications(appsJson.data ?? []);
      setAppDocsMap((docsJson.data ?? {}) as Record<string, AppDoc[]>);
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

  async function handleDelete(app: ApplicationRow) {
    setDeletingId(app.id);
    try {
      await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      toast.show(`'${app.company_name}' 지원을 삭제했어요`, {
        variant: "success",
        undoLabel: "되돌리기",
        onUndo: async () => {
          // 같은 데이터로 새로 생성 (id는 새로 발급됨)
          const res = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name: app.company_name,
              position: app.position,
              status: app.status,
              job_url: app.job_url,
              salary_range: app.salary_range,
              location: app.location,
              applied_at: app.applied_at,
              deadline: app.deadline,
              notes: app.notes,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            setApplications((prev) => [json.data as ApplicationRow, ...prev]);
            toast.show("복구했어요", { variant: "success", duration: 2500 });
          }
        },
      });
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

      {/* 데스크탑 테이블 / 모바일 카드 */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* 헤더 (md 이상에서만) */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>회사 / 직무</span>
          <span>상태</span>
          <span>지원일</span>
          <span>마감일</span>
          <span />
        </div>

        {loading ? (
          <ul>
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-3 w-20 hidden md:block" />
                  <Skeleton className="h-3 w-20 hidden md:block" />
                </div>
              </li>
            ))}
          </ul>
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
                className="group flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_40px] md:gap-4 md:items-center px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
              >
                {/* Row 1 (모바일): 회사/직무 + 상태 + 삭제 한 줄 */}
                <div className="flex items-start justify-between md:block">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {app.company_name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      {app.position}
                    </p>
                    {/* 연결된 문서 알약 */}
                    {(appDocsMap[app.id]?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {appDocsMap[app.id]!.slice(0, 3).map((d) => (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 max-w-[140px]"
                            title={d.title}
                          >
                            {d.is_link ? (
                              <NotebookText size={9} className="flex-shrink-0" />
                            ) : (
                              <FileText size={9} className="flex-shrink-0" />
                            )}
                            <span className="truncate">{d.title}</span>
                          </span>
                        ))}
                        {appDocsMap[app.id]!.length > 3 && (
                          <span className="text-[10px] text-zinc-400">
                            +{appDocsMap[app.id]!.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* 모바일에서만 status + delete 같은 줄에 */}
                  <div className="md:hidden flex items-center gap-2 ml-3 flex-shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
                    >
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(app);
                      }}
                      disabled={deletingId === app.id}
                      className="rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 상태 (데스크탑) */}
                <div className="hidden md:flex items-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                </div>

                {/* 날짜 (모바일은 한 줄로 / 데스크탑은 각 컬럼) */}
                <div className="flex md:hidden items-center gap-2 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>지원 {app.applied_at ?? "—"}</span>
                  <span className="text-zinc-300">·</span>
                  <span>마감 {app.deadline ?? "—"}</span>
                  {app.deadline && <DDayBadge date={app.deadline} prefix="D" />}
                </div>
                <div className="hidden md:flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                  {app.applied_at ?? "—"}
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{app.deadline ?? "—"}</span>
                  {app.deadline && <DDayBadge date={app.deadline} prefix="D" />}
                </div>

                {/* 데스크탑 삭제 버튼 */}
                <div className="hidden md:flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(app);
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
