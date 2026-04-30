"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DocumentType } from "@/types/database";

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "resume", label: "이력서" },
  { value: "cover_letter", label: "자기소개서" },
  { value: "portfolio", label: "포트폴리오" },
  { value: "other", label: "기타" },
];

interface Props {
  folderId: string | null;
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadModal({ folderId, onClose, onUploaded }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("resume");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목은 필수입니다.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      let filePath: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/documents/upload", {
          method: "POST",
          body: fd,
        });
        const upJson = await upRes.json();
        if (!upRes.ok) {
          setError(upJson.error ?? "업로드 실패");
          return;
        }
        filePath = upJson.path;
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          file_url: filePath,
          folder_id: folderId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "저장 실패");
        return;
      }
      onUploaded();
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
          <h2 className="text-base font-semibold">문서 업로드</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          <Field label="제목 *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 2026 상반기 이력서"
              className={inputCls}
            />
          </Field>

          <Field label="유형">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className={inputCls}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="파일 (선택, PDF/PNG/JPG, 10MB 이하)">
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-zinc-700 dark:text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 dark:file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
              className="rounded-lg bg-[#3182F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a6fe8] disabled:opacity-50 transition-colors"
            >
              {pending ? "업로드 중..." : "업로드"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6]";

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
