"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface EssayMeta {
  id: string;
  company_name: string;
  job_title: string;
  jd_url: string | null;
  applied_date: string | null;
  deadline: string | null;
}

interface Props {
  essay: EssayMeta;
  onClose: () => void;
  onSaved: () => void;
}

export function EditEssayModal({ essay, onClose, onSaved }: Props) {
  const [companyName, setCompanyName] = useState(essay.company_name);
  const [jobTitle, setJobTitle] = useState(essay.job_title);
  const [jdUrl, setJdUrl] = useState(essay.jd_url ?? "");
  const [appliedDate, setAppliedDate] = useState(essay.applied_date ?? "");
  const [deadline, setDeadline] = useState(essay.deadline ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      setError("회사명과 직무명은 필수입니다.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/essays/${essay.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          job_title: jobTitle.trim(),
          jd_url: jdUrl.trim() || null,
          applied_date: appliedDate || null,
          deadline: deadline || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "저장 실패");
        return;
      }
      onSaved();
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
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold">회사 정보 편집</h2>
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="회사명 *">
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="직무명 *">
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="JD 링크">
            <input
              type="url"
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder="https://"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="지원일">
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="마감일">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            >
              {pending ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3182F6]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
