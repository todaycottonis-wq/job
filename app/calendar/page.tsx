import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">캘린더</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        면접 일정과 마감일을 관리하세요.
      </p>

      <div className="mt-6">
        <CalendarView />
      </div>
    </div>
  );
}
