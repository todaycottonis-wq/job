"use client";

import { useState } from "react";
import { X, Upload, Link as LinkIcon } from "lucide-react";
import type { DocumentType } from "@/types/database";

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "resume", label: "이력서" },
  { value: "cover_letter", label: "자기소개서" },
  { value: "portfolio", label: "포트폴리오" },
  { value: "other", label: "기타" },
];

type SourceTab = "file" | "notion";

interface Props {
  folderId: string | null;
  onClose: () => void;
  onUploaded: () => void;
}

function isNotionUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.endsWith("notion.so") ||
      u.hostname.endsWith("notion.site") ||
      u.hostname.endsWith("www.notion.so")
    );
  } catch {
    return false;
  }
}

export function UploadModal({ folderId, onClose, onUploaded }: Props) {
  const [tab, setTab] = useState<SourceTab>("file");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("resume");
  const [file, setFile] = useState<File | null>(null);
  const [notionUrl, setNotionUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목은 필수입니다.");
      return;
    }
    if (tab === "notion") {
      if (!notionUrl.trim()) {
        setError("노션 페이지 URL을 입력해주세요.");
        return;
      }
      if (!isNotionUrl(notionUrl.trim())) {
        setError("노션 URL이 아닌 것 같아요. (notion.so 또는 notion.site)");
        return;
      }
    }
    setPending(true);
    setError(null);
    try {
      let fileUrl: string | null = null;

      if (tab === "file" && file) {
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
        fileUrl = upJson.path;
      } else if (tab === "notion") {
        fileUrl = notionUrl.trim();
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          file_url: fileUrl,
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
          <h2 className="text-base font-semibold">문서 추가</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 탭 */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
            <button
              type="button"
              onClick={() => {
                setTab("file");
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                tab === "file"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Upload size={13} />
              파일 업로드
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("notion");
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                tab === "notion"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <LinkIcon size={13} />
              노션 링크
            </button>
          </div>
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

          {tab === "file" ? (
            <Field label="파일 (선택, PDF/PNG/JPG, 10MB 이하)">
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-zinc-700 dark:text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 dark:file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700"
              />
            </Field>
          ) : (
            <>
              <Field label="노션 페이지 URL *">
                <input
                  type="url"
                  value={notionUrl}
                  onChange={(e) => setNotionUrl(e.target.value)}
                  placeholder="https://www.notion.so/..."
                  className={inputCls}
                />
              </Field>
              <p className="text-[11px] text-zinc-400 leading-relaxed -mt-1">
                💡 노션에서 페이지를 열고 우측 상단 <strong>공유 → 링크 복사</strong>로 가져온 URL을 붙여넣으세요. 카드를 클릭하면 새 탭에서 노션이 열립니다.
              </p>
            </>
          )}

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
              {pending
                ? tab === "notion"
                  ? "저장 중..."
                  : "업로드 중..."
                : tab === "notion"
                ? "노션 링크 추가"
                : "업로드"}
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
