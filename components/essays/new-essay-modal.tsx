"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

function todayYmd(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function NewEssayModal({ onClose, onCreated }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [appliedDate, setAppliedDate] = useState(todayYmd());
  const [deadline, setDeadline] = useState("");
  const [addToApplications, setAddToApplications] = useState(true);
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
      const res = await fetch("/api/essays", {
        method: "POST",
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
        setError(json.error ?? "생성 실패");
        return;
      }

      // 사용자가 동의했다면, 같은 회사·직무로 '작성중' 지원도 함께 생성
      if (addToApplications) {
        try {
          const appRes = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name: companyName.trim(),
              position: jobTitle.trim(),
              status: "drafting",
              job_url: jdUrl.trim() || null,
              // 아직 지원 전이므로 applied_at은 비워둠
              deadline: deadline || null,
            }),
          });
          if (!appRes.ok) {
            toast.show(
              "자소서는 생성됐는데 지원현황 추가는 실패했어요. 지원현황에서 직접 추가해주세요.",
              { variant: "error", duration: 4500 }
            );
          } else {
            toast.show("지원현황에도 '작성중'으로 추가했어요", {
              variant: "success",
              duration: 2500,
            });
          }
        } catch {
          toast.show(
            "자소서는 생성됐는데 지원현황 추가는 실패했어요.",
            { variant: "error", duration: 4500 }
          );
        }
      }

      onCreated?.();
      // 자동으로 Lv2로 이동
      router.push(`/essays/${json.data.id}`);
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
          <h2 className="text-base font-semibold">새 자소서</h2>
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
                placeholder="예) 카카오"
                className={inputCls}
                autoFocus
              />
            </Field>
            <Field label="직무명 *">
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="예) 프로덕트 디자이너"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="JD 링크 (선택)">
            <input
              type="url"
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder="https://"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="지원일 *">
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="마감일 *">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <label className="flex items-start gap-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 p-3 cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="checkbox"
              checked={addToApplications}
              onChange={(e) => setAddToApplications(e.target.checked)}
              className="mt-0.5 rounded border-zinc-300 text-[#3182F6] focus:ring-[#3182F6]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                지원현황에도 &lsquo;작성중&rsquo;으로 추가
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                같은 회사·직무로 지원 카드를 만들어요. 나중에 상태를 바꾸면 돼요.
              </p>
            </div>
          </label>

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
              className="rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] active:bg-[#1560d4] disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              {pending ? "생성 중..." : "만들고 시작하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
