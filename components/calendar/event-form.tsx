"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { CalendarEvent, CalendarEventType } from "@/types/database";

const TYPE_OPTIONS: { value: CalendarEventType; label: string }[] = [
  { value: "interview", label: "면접" },
  { value: "deadline", label: "마감일" },
  { value: "follow_up", label: "팔로우업" },
  { value: "other", label: "기타" },
];

interface Props {
  initial?: CalendarEvent;
  presetDate?: string; // YYYY-MM-DD
  onClose: () => void;
  onSaved: () => void;
}

function toLocalInput(iso: string): string {
  // ISO → "YYYY-MM-DDTHH:mm" (datetime-local 입력용)
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function EventForm({ initial, presetDate, onClose, onSaved }: Props) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [eventType, setEventType] = useState<CalendarEventType>(
    initial?.event_type ?? "interview"
  );
  const [startsAt, setStartsAt] = useState(() =>
    initial
      ? toLocalInput(initial.starts_at)
      : presetDate
      ? `${presetDate}T10:00`
      : toLocalInput(new Date().toISOString())
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [meetingUrl, setMeetingUrl] = useState(initial?.meeting_url ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
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
      const url = isEdit
        ? `/api/calendar-events/${initial!.id}`
        : "/api/calendar-events";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          event_type: eventType,
          starts_at: new Date(startsAt).toISOString(),
          location: location || null,
          meeting_url: meetingUrl || null,
          description: description || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "오류가 발생했습니다.");
        return;
      }
      onSaved();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm("이 일정을 삭제할까요?")) return;
    setPending(true);
    try {
      await fetch(`/api/calendar-events/${initial.id}`, { method: "DELETE" });
      onSaved();
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
          <h2 className="text-base font-semibold">
            {isEdit ? "일정 수정" : "일정 추가"}
          </h2>
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
              placeholder="예) 카카오 1차 면접"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="유형">
              <select
                value={eventType}
                onChange={(e) =>
                  setEventType(e.target.value as CalendarEventType)
                }
                className={inputCls}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="시작">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="장소">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예) 판교 카카오 본사"
              className={inputCls}
            />
          </Field>

          <Field label="미팅 URL">
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className={inputCls}
            />
          </Field>

          <Field label="메모">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between items-center pt-1 pb-2">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  삭제
                </button>
              )}
            </div>
            <div className="flex gap-2">
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
                {pending ? "저장 중..." : "저장"}
              </button>
            </div>
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
