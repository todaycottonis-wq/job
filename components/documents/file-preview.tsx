"use client";

import { useEffect, useState } from "react";
import { X, Download, ExternalLink, Loader2 } from "lucide-react";
import type { Document } from "@/types/database";

interface Props {
  doc: Document;
  onClose: () => void;
}

function ext(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

function isImage(p: string) {
  return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext(p));
}
function isPdf(p: string) {
  return ext(p) === "pdf";
}

export function FilePreview({ doc, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/documents/${doc.id}/url`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "URL 발급 실패");
        if (!cancelled) setUrl(json.url);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "오류");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc.id]);

  const filePath = doc.file_url ?? "";
  const supportsInlinePreview = isImage(filePath) || isPdf(filePath);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl h-[85vh] rounded-2xl bg-white dark:bg-zinc-900 shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-sm font-semibold truncate">{doc.title}</p>
          <div className="flex items-center gap-2">
            {url && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <ExternalLink size={12} />
                  새 탭
                </a>
                <a
                  href={url}
                  download={doc.title}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] px-2.5 py-1.5 text-xs font-semibold text-white"
                >
                  <Download size={12} />
                  다운로드
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="닫기"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
          {loading && (
            <div className="h-full flex items-center justify-center text-sm text-zinc-400">
              <Loader2 size={16} className="animate-spin mr-2" />
              불러오는 중...
            </div>
          )}
          {error && (
            <div className="h-full flex flex-col items-center justify-center text-sm text-red-500">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && url && (
            <>
              {isImage(filePath) ? (
                <div className="h-full flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={doc.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow"
                  />
                </div>
              ) : isPdf(filePath) ? (
                <iframe
                  src={url}
                  title={doc.title}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <Download size={20} className="text-zinc-500" />
                  </div>
                  <p className="text-sm font-semibold mb-1">
                    인앱 미리보기를 지원하지 않는 파일이에요
                  </p>
                  <p className="text-xs text-zinc-500 mb-4">
                    {ext(filePath).toUpperCase()} 파일은 다운로드 후 확인해주세요
                  </p>
                  <a
                    href={url}
                    download={doc.title}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3182F6] hover:bg-[#1a6fe8] px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    <Download size={14} />
                    다운로드
                  </a>
                </div>
              )}
              {!supportsInlinePreview && false}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
