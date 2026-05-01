"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Check,
  Circle,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DDayBadge } from "@/components/ui/dday-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { countChars } from "@/lib/char-count";
import { EditEssayModal } from "./edit-essay-modal";

interface Question {
  id: string;
  essay_id: string;
  order: number;
  content: string;
  char_limit: number;
  count_mode: "with_spaces" | "without_spaces";
  answer: string;
}

interface EssayWithQuestions {
  id: string;
  company_name: string;
  job_title: string;
  jd_url: string | null;
  applied_date: string | null;
  deadline: string | null;
  essay_questions: Question[];
}

export function EssayDetail({ essayId }: { essayId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [essay, setEssay] = useState<EssayWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingQ, setCreatingQ] = useState(false);
  const [editing, setEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchEssay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/essays/${essayId}`);
      if (res.status === 404) {
        toast.show("자소서를 찾을 수 없어요", { variant: "error" });
        router.push("/essays");
        return;
      }
      const json = await res.json();
      setEssay(json.data ?? null);
    } finally {
      setLoading(false);
    }
  }, [essayId, router, toast]);

  useEffect(() => {
    void fetchEssay();
  }, [fetchEssay]);

  async function addQuestion() {
    setCreatingQ(true);
    try {
      const res = await fetch(`/api/essays/${essayId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ char_limit: 500 }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        // 바로 작성 페이지로
        router.push(`/essays/${essayId}/questions/${json.data.id}`);
      }
    } finally {
      setCreatingQ(false);
    }
  }

  async function deleteQuestion(q: Question) {
    if (!confirm("이 문항을 삭제할까요?")) return;
    await fetch(`/api/essays/${essayId}/questions/${q.id}`, {
      method: "DELETE",
    });
    setEssay((prev) =>
      prev
        ? { ...prev, essay_questions: prev.essay_questions.filter((x) => x.id !== q.id) }
        : prev
    );
    toast.show("문항을 삭제했어요", { variant: "success" });
  }

  async function deleteEssay() {
    if (!essay) return;
    if (!confirm(`'${essay.company_name}' 자소서 전체를 삭제할까요? 모든 문항도 사라져요.`))
      return;
    await fetch(`/api/essays/${essayId}`, { method: "DELETE" });
    toast.show("자소서를 삭제했어요", { variant: "success" });
    router.push("/essays");
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !essay) return;
    const oldIdx = essay.essay_questions.findIndex((q) => q.id === active.id);
    const newIdx = essay.essay_questions.findIndex((q) => q.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;

    const reordered = arrayMove(essay.essay_questions, oldIdx, newIdx);
    setEssay({ ...essay, essay_questions: reordered });

    // 서버에 새 순서 저장 (best-effort)
    await fetch(`/api/essays/${essayId}/questions/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((q) => q.id) }),
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-2 w-full mt-4" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!essay) return null;

  const total = essay.essay_questions.length;
  const done = essay.essay_questions.filter((q) => q.answer.trim().length > 0).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      {/* 헤더 */}
      <Link
        href="/essays"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
      >
        <ArrowLeft size={12} />
        자소서 목록
      </Link>

      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {essay.company_name}
            </h1>
            {essay.deadline && <DDayBadge date={essay.deadline} prefix="D" />}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {essay.job_title}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
            {essay.applied_date && <span>지원일 {essay.applied_date}</span>}
            {essay.deadline && <span>· 마감 {essay.deadline}</span>}
            {essay.jd_url && (
              <a
                href={essay.jd_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#3182F6] hover:underline"
              >
                JD 링크
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="회사 정보 편집"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={deleteEssay}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 text-zinc-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/40 transition-colors"
            title="자소서 삭제"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
          <span>
            진행률 <span className="font-semibold text-zinc-900 dark:text-zinc-50">{pct}%</span>
          </span>
          <span>{done} / {total} 문항 완료</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-[#3182F6] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 문항 리스트 */}
      <div className="mt-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {total === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-zinc-400 mb-3">아직 문항이 없어요.</p>
            <button
              onClick={addQuestion}
              disabled={creatingQ}
              className="inline-flex items-center gap-1 rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={13} />
              {creatingQ ? "생성 중..." : "첫 문항 추가"}
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={essay.essay_questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {essay.essay_questions.map((q, idx) => (
                  <SortableQuestionRow
                    key={q.id}
                    q={q}
                    index={idx}
                    essayId={essayId}
                    onDelete={() => deleteQuestion(q)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {total > 0 && (
        <button
          onClick={addQuestion}
          disabled={creatingQ}
          className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#3182F6] hover:text-[#3182F6] py-3 text-sm font-medium text-zinc-500 transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          {creatingQ ? "생성 중..." : "문항 추가"}
        </button>
      )}

      {editing && (
        <EditEssayModal
          essay={essay}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            void fetchEssay();
          }}
        />
      )}
    </div>
  );
}

function SortableQuestionRow({
  q,
  index,
  essayId,
  onDelete,
}: {
  q: Question;
  index: number;
  essayId: string;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const len = countChars(q.answer, q.count_mode);
  const status = q.answer.trim().length === 0 ? "empty" : len >= q.char_limit * 0.8 ? "done" : "in_progress";
  const preview = (q.content || "").slice(0, 30) || "(질문 없음)";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 px-3 py-3 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing rounded p-1 text-zinc-300 hover:text-zinc-500"
        aria-label="드래그로 순서 변경"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </button>

      <Link
        href={`/essays/${essayId}/questions/${q.id}`}
        className="flex-1 min-w-0 flex items-center gap-3"
      >
        <span className="flex-shrink-0 text-xs font-mono text-zinc-400 w-6 text-center">
          {String(index + 1).padStart(2, "0")}
        </span>

        {status === "done" ? (
          <Check size={14} className="text-green-500 flex-shrink-0" />
        ) : status === "in_progress" ? (
          <Circle size={14} className="text-amber-500 flex-shrink-0" />
        ) : (
          <Circle size={14} className="text-zinc-300 flex-shrink-0" />
        )}

        <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate flex-1">
          {preview}
          {q.content.length > 30 && "…"}
        </p>

        <span className="text-[11px] text-zinc-400 font-mono flex-shrink-0">
          {len} / {q.char_limit}
        </span>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        aria-label="삭제"
      >
        <Trash2 size={12} />
      </button>
    </li>
  );
}
