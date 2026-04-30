"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type {
  ApplicationRow,
  ApplicationFormData,
  ApplicationFormMode,
} from "@/types/application";
import { APPLICATION_STATUS_LABELS } from "@/types/application";
import type { ApplicationStatus } from "@/types/database";

interface ApplicationFormProps {
  mode: ApplicationFormMode;
  initial?: ApplicationRow;
  onSuccess: (app: ApplicationRow) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

const EMPTY_FORM: ApplicationFormData = {
  company_name: "",
  position: "",
  status: "wishlist",
  job_url: "",
  salary_range: "",
  location: "",
  applied_at: "",
  deadline: "",
  notes: "",
};

export function ApplicationForm({
  mode,
  initial,
  onSuccess,
  onClose,
}: ApplicationFormProps) {
  const [form, setForm] = useState<ApplicationFormData>(
    initial
      ? {
          company_name: initial.company_name,
          position: initial.position,
          status: initial.status,
          job_url: initial.job_url ?? "",
          salary_range: initial.salary_range ?? "",
          location: initial.location ?? "",
          applied_at: initial.applied_at ?? "",
          deadline: initial.deadline ?? "",
          notes: initial.notes ?? "",
        }
      : EMPTY_FORM
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof ApplicationFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim() || !form.position.trim()) {
      setError("회사명과 직무명은 필수입니다.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/applications"
          : `/api/applications/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.company_name.trim(),
          position: form.position.trim(),
          status: form.status,
          job_url: form.job_url || null,
          salary_range: form.salary_range || null,
          location: form.location || null,
          applied_at: form.applied_at || null,
          deadline: form.deadline || null,
          notes: form.notes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "오류가 발생했습니다.");
        return;
      }
      onSuccess(json.data as ApplicationRow);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold">
            {mode === "create" ? "지원 추가" : "지원 수정"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="회사명 *">
              <input
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
                placeholder="예) 카카오"
                className={inputCls}
              />
            </Field>
            <Field label="직무명 *">
              <input
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder="예) 프론트엔드 개발자"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="진행 상태">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {APPLICATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="근무지">
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="예) 서울 강남구"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="지원일">
              <input
                type="date"
                value={form.applied_at}
                onChange={(e) => set("applied_at", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="마감일">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="채용공고 URL">
            <input
              type="url"
              value={form.job_url}
              onChange={(e) => set("job_url", e.target.value)}
              placeholder="https://"
              className={inputCls}
            />
          </Field>

          <Field label="급여 범위">
            <input
              value={form.salary_range}
              onChange={(e) => set("salary_range", e.target.value)}
              placeholder="예) 5000-6000만원"
              className={inputCls}
            />
          </Field>

          <Field label="메모">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="채용 담당자, 면접 준비 사항 등..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
            >
              {pending ? "저장 중..." : mode === "create" ? "추가" : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}
