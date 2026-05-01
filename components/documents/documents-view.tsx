"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Folder as FolderIcon,
  FileText,
  ChevronRight,
  Plus,
  Upload,
  Trash2,
  ExternalLink,
  NotebookText,
} from "lucide-react";
import type { Document, Folder, DocumentType } from "@/types/database";
import { UploadModal } from "./upload-modal";
import { FolderModal } from "./folder-modal";
import { FilePreview } from "./file-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getFolderColor } from "@/lib/folder-colors";

const TYPE_LABEL: Record<DocumentType, string> = {
  resume: "이력서",
  cover_letter: "자기소개서",
  portfolio: "포트폴리오",
  other: "기타",
};

export function DocumentsView() {
  const toast = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showFolder, setShowFolder] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [foldersRes, docsRes] = await Promise.all([
        fetch("/api/folders"),
        fetch(
          currentFolder
            ? `/api/documents?folder_id=${currentFolder.id}`
            : "/api/documents?folder_id=null"
        ),
      ]);
      const foldersJson = await foldersRes.json();
      const docsJson = await docsRes.json();
      setFolders(foldersJson.data ?? []);
      setDocs(docsJson.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  async function deleteFolder(folder: Folder) {
    if (
      !confirm(
        `'${folder.name}' 폴더를 삭제할까요? 안의 문서는 미분류로 옮겨집니다.`
      )
    )
      return;
    await fetch(`/api/folders/${folder.id}`, { method: "DELETE" });
    toast.show(`'${folder.name}' 폴더를 삭제했어요`, { variant: "success" });
    void fetchAll();
  }

  async function deleteDoc(doc: Document) {
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    toast.show(`'${doc.title}' 문서를 삭제했어요`, { variant: "success" });
  }

  return (
    <div className="space-y-4">
      {/* 헤더: 브레드크럼 + 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => setCurrentFolder(null)}
            className={`font-medium ${
              currentFolder
                ? "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                : "text-zinc-900 dark:text-zinc-50"
            }`}
          >
            전체
          </button>
          {currentFolder && (
            <>
              <ChevronRight size={14} className="text-zinc-300" />
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {currentFolder.emoji ? `${currentFolder.emoji} ` : ""}
                {currentFolder.name}
              </span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {!currentFolder && (
            <button
              onClick={() => setShowFolder(true)}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Plus size={13} />
              폴더 추가
            </button>
          )}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1 rounded-lg bg-[#3182F6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a6fe8] transition-colors"
          >
            <Upload size={13} />
            파일 업로드
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
            >
              <div className="flex items-start gap-2.5">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 폴더 (루트일 때만) */}
          {!currentFolder && folders.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                폴더
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {folders.map((f) => {
                  const c = getFolderColor(f.color);
                  return (
                  <div
                    key={f.id}
                    className="group relative rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 hover:border-[#3182F6] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
                    onClick={() => setCurrentFolder(f)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                        <FolderIcon size={16} fill={c.icon} stroke={c.stroke} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">폴더</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(f);
                        }}
                        className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 문서 */}
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              문서 {docs.length > 0 && `(${docs.length})`}
            </p>
            {docs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center">
                <p className="text-sm text-zinc-400">아직 문서가 없습니다.</p>
                <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">
                  파일 업로드 버튼으로 추가해보세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {docs.map((d) => (
                  <DocumentCard
                    key={d.id}
                    doc={d}
                    onDelete={() => deleteDoc(d)}
                    onPreview={() => setPreviewDoc(d)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showUpload && (
        <UploadModal
          folderId={currentFolder?.id ?? null}
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            void fetchAll();
          }}
        />
      )}

      {showFolder && (
        <FolderModal
          onClose={() => setShowFolder(false)}
          onCreated={() => {
            setShowFolder(false);
            void fetchAll();
          }}
        />
      )}

      {previewDoc && (
        <FilePreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}

function isExternalUrl(url: string | null | undefined): boolean {
  return !!url && /^https?:\/\//i.test(url);
}
function isNotionUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.endsWith("notion.so") || u.hostname.endsWith("notion.site")
    );
  } catch {
    return false;
  }
}

function DocumentCard({
  doc,
  onDelete,
  onPreview,
}: {
  doc: Document;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const isLink = isExternalUrl(doc.file_url);
  const notion = isNotionUrl(doc.file_url);
  const hasFile = !!doc.file_url && !isLink;

  const inner = (
    <div className="flex items-start gap-2.5">
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
          notion
            ? "bg-zinc-900 dark:bg-zinc-100"
            : "bg-zinc-100 dark:bg-zinc-800"
        }`}
      >
        {notion ? (
          <NotebookText size={16} className="text-white dark:text-zinc-900" />
        ) : (
          <FileText size={16} className="text-zinc-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate flex items-center gap-1">
          {doc.title}
          {isLink && (
            <ExternalLink size={11} className="text-zinc-400 flex-shrink-0" />
          )}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {notion ? "노션 · " : ""}
          {TYPE_LABEL[doc.type]}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        aria-label="삭제"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );

  const wrapperCls =
    "group relative rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all block";

  if (isLink) {
    return (
      <a
        href={doc.file_url!}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperCls}
      >
        {inner}
      </a>
    );
  }

  if (hasFile) {
    return (
      <button
        type="button"
        onClick={onPreview}
        className={wrapperCls + " text-left w-full cursor-pointer"}
      >
        {inner}
      </button>
    );
  }

  return <div className={wrapperCls}>{inner}</div>;
}
