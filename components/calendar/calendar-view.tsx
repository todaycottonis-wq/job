"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type {
  CalendarEvent,
  CalendarEventType,
  UserEventType,
} from "@/types/database";
import { getHolidayForDate } from "@/lib/holidays";
import { getEventColor } from "@/lib/event-colors";
import { EventForm } from "./event-form";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const TYPE_COLORS: Record<CalendarEventType, string> = {
  interview: "bg-purple-500",
  deadline: "bg-red-500",
  follow_up: "bg-blue-500",
  other: "bg-zinc-400",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarView() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [userTypes, setUserTypes] = useState<UserEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CalendarEvent | undefined>();
  const [presetDate, setPresetDate] = useState<string | undefined>();

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/event-types");
      const json = await res.json();
      setUserTypes(json.data ?? []);
    })();
  }, []);

  const userTypeMap = useMemo(
    () => new Map(userTypes.map((t) => [t.id, t])),
    [userTypes]
  );

  function getDotClass(ev: CalendarEvent): string {
    const userTypeId = (ev as unknown as { user_event_type_id?: string | null })
      .user_event_type_id;
    if (userTypeId) {
      const t = userTypeMap.get(userTypeId);
      if (t) return getEventColor(t.color).bg;
    }
    return TYPE_COLORS[ev.event_type];
  }

  // 그리드 시작/끝 (이전/다음 달의 빈칸 채움)
  const gridDays = useMemo(() => {
    const first = startOfMonth(cursor);
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay()); // 그 주 일요일
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const from = ymd(gridDays[0]);
      const to = ymd(new Date(gridDays[gridDays.length - 1].getTime() + 86400000));
      const res = await fetch(`/api/calendar-events?from=${from}&to=${to}`);
      const json = await res.json();
      setEvents(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [gridDays]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  function prevMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }
  function today() {
    setCursor(startOfMonth(new Date()));
  }

  function openCreateForDate(d: Date) {
    setEditTarget(undefined);
    setPresetDate(ymd(d));
    setShowForm(true);
  }
  function openEdit(ev: CalendarEvent) {
    setEditTarget(ev);
    setPresetDate(undefined);
    setShowForm(true);
  }

  const today_ = new Date();
  const monthLabel = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);

  // 날짜별 이벤트 인덱스
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = ymd(new Date(e.starts_at));
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-semibold tracking-tight min-w-[7ch] text-center">
            {monthLabel}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={today}
            className="ml-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            오늘
          </button>
        </div>
        <button
          onClick={() => openCreateForDate(today_)}
          className="flex items-center gap-1 rounded-lg bg-[#3182F6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a6fe8] transition-colors"
        >
          <Plus size={13} />
          일정 추가
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`px-2 py-2 text-xs font-medium text-center ${
              i === 0
                ? "text-red-500"
                : i === 6
                ? "text-blue-500"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 그리드 */}
      <div className="grid grid-cols-7 grid-rows-6">
        {gridDays.map((d, i) => {
          const inMonth = d >= monthStart && d < monthEnd;
          const isToday = sameDay(d, today_);
          const dayEvents = byDay.get(ymd(d)) ?? [];
          const dayOfWeek = d.getDay();
          const holiday = getHolidayForDate(d);
          const isHolidayRed = !!holiday; // 공휴일은 일요일처럼 빨간색
          return (
            <button
              key={i}
              onClick={() => openCreateForDate(d)}
              className={`group relative min-h-[88px] border-r border-b border-zinc-50 dark:border-zinc-800/60 last:border-r-0 [&:nth-child(7n)]:border-r-0 px-2 py-1.5 text-left transition-colors ${
                inMonth
                  ? "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  : "bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`inline-flex items-center justify-center text-xs font-medium ${
                    !inMonth
                      ? "text-zinc-300 dark:text-zinc-700"
                      : isToday
                      ? "bg-[#3182F6] text-white rounded-full w-5 h-5"
                      : isHolidayRed || dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                      ? "text-blue-500"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {d.getDate()}
                </span>
                {holiday && inMonth && (
                  <span className="text-[9px] font-semibold text-red-500 truncate max-w-[60px]" title={holiday.name}>
                    {holiday.name}
                  </span>
                )}
              </div>

              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(ev);
                    }}
                    className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 truncate"
                  >
                    <span
                      className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${getDotClass(ev)}`}
                    />
                    <span className="truncate">{ev.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-zinc-400 px-1">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="px-4 py-2 text-xs text-zinc-400 text-center border-t border-zinc-100 dark:border-zinc-800">
          불러오는 중...
        </div>
      )}

      {showForm && (
        <EventForm
          initial={editTarget}
          presetDate={presetDate}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            void fetchEvents();
          }}
        />
      )}
    </div>
  );
}
