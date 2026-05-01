"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useDebounce } from "@/lib/use-debounce";
import { countChars, modeLabel, type CountMode } from "@/lib/char-count";

interface Question {
  id: string;
  essay_id: string;
  order: number;
  content: string;
  char_limit: number;
  count_mode: CountMode;
  answer: string;
}

interface EssayHeader {
  id: string;
  company_name: string;
  job_title: string;
}

interface FullEssay extends EssayHeader {
  essay_questions: Question[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function QuestionEditor({
  essayId,
  questionId,
}: {
  essayId: string;
  questionId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [essay, setEssay] = useState<EssayHeader | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

  // 편집 가능한 로컬 상태
  const [content, setContent] = useState("");
  const [charLimit, setCharLimit] = useState(500);
  const [countMode, setCountMode] = useState<CountMode>("with_spaces");
  const [answer, setAnswer] = useState("");

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const initialLoadRef = useRef(true);

  // 자동 저장 — 1.5초 debounce
  const debouncedContent = useDebounce(content, 1500);
  const debouncedCharLimit = useDebounce(charLimit, 1500);
  const debouncedCountMode = useDebounce(countMode, 500);
  const debouncedAnswer = useDebounce(answer, 1500);

  // 초기 fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/essays/${essayId}`);
        if (res.status === 404) {
          toast.show("자소서를 찾을 수 없어요", { variant: "error" });
          router.push("/essays");
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        const e = json.data as FullEssay;
        setEssay({
          id: e.id,
          company_name: e.company_name,
          job_title: e.job_title,
        });
        const idx = e.essay_questions.findIndex((q) => q.id === questionId);
        const q = idx >= 0 ? e.essay_questions[idx] : null;
        if (!q) {
          toast.show("문항을 찾을 수 없어요", { variant: "error" });
          router.push(`/essays/${essayId}`);
          return;
        }
        setQuestion(q);
        setQuestionIndex(idx);
        setContent(q.content);
        setCharLimit(q.char_limit);
        setCountMode(q.count_mode);
        setAnswer(q.answer);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [essayId, questionId, router, toast]);

  // 자동 저장 effect
  const save = useCallback(
    async (payload: {
      content?: string;
      char_limit?: number;
      count_mode?: CountMode;
      answer?: string;
    }) => {
      setSaveState("saving");
      try {
        const res = await fetch(
          `/api/essays/${essayId}/questions/${questionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          setSaveState("error");
          return;
        }
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [essayId, questionId]
  );

  // 디바운스된 값이 바뀌면 저장 (단 초기 로드 직후엔 X)
  useEffect(() => {
    if (initialLoadRef.current || !question) return;
    void save({
      content: debouncedContent,
      char_limit: debouncedCharLimit,
      count_mode: debouncedCountMode,
      answer: debouncedAnswer,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedCharLimit, debouncedCountMode, debouncedAnswer]);

  // 초기 로드 끝난 직후 ref를 false로
  useEffect(() => {
    if (!loading && question) {
      const t = setTimeout(() => {
        initialLoadRef.current = false;
      }, 100);
      return () => clearTimeout(t);
    }
  }, [loading, question]);

  async function handleDelete() {
    if (!confirm("이 문항을 삭제할까요?")) return;
    await fetch(`/api/essays/${essayId}/questions/${questionId}`, {
      method: "DELETE",
    });
    toast.show("문항을 삭제했어요", { variant: "success" });
    router.push(`/essays/${essayId}`);
  }

  if (loading || !essay || !question) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const len = countChars(answer, countMode);
  const ratio = charLimit > 0 ? len / charLimit : 0;
  const counterColor =
    ratio >= 1
      ? "text-red-600"
      : ratio >= 0.8
      ? "text-amber-600"
      : "text-zinc-500 dark:text-zinc-400";

  return (
    <div className="pb-24">
      {/* 브레드크럼 */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/essays/${essayId}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft size={12} />
          <span className="font-medium">{essay.company_name}</span>
          <span className="text-zinc-300">·</span>
          <span>문항 {questionIndex + 1}</span>
        </Link>

        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} />
          <button
            onClick={handleDelete}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 질문 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="질문 내용을 입력하세요. 예) 본인의 지원 동기에 대해 작성해주세요."
        rows={3}
        className="w-full text-lg font-bold tracking-tight bg-transparent border-0 focus:outline-none resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 mb-4"
      />

      {/* 설정 바 */}
      <div className="flex items-center gap-3 flex-wrap pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4 text-sm">
        <label className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">글자수 제한</span>
          <input
            type="number"
            value={charLimit}
            onChange={(e) =>
              setCharLimit(Math.max(0, parseInt(e.target.value || "0", 10)))
            }
            min={0}
            className="w-20 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs"
          />
          <span className="text-xs text-zinc-500">자</span>
        </label>

        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 flex">
          {(["with_spaces", "without_spaces"] as CountMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCountMode(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                countMode === m
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              {modeLabel(m)}
            </button>
          ))}
        </div>
      </div>

      {/* 답변 작성 */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="여기에 답변을 작성하세요..."
        rows={20}
        className="w-full bg-transparent border-0 focus:outline-none resize-none text-[15px] leading-relaxed placeholder:text-zinc-300 dark:placeholder:text-zinc-700 min-h-[400px]"
      />

      {/* 카운터 (우측 하단 고정) */}
      <div className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-20 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg px-3.5 py-2">
        <p className={`text-xs font-mono font-semibold ${counterColor}`}>
          {len} / {charLimit}자
          <span className="ml-1 font-normal text-zinc-400">
            ({modeLabel(countMode)})
          </span>
        </p>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
        <Loader2 size={11} className="animate-spin" />
        저장 중...
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <Check size={11} />
        저장됨
      </span>
    );
  }
  return (
    <span className="text-xs text-red-500">저장 실패 — 잠시 후 다시 시도</span>
  );
}
