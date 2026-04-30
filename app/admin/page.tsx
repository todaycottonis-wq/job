import { requireAdmin } from "@/lib/admin";
import { logEvent } from "@/lib/logger";

export default async function AdminPage() {
  const { supabase, user } = await requireAdmin();

  await logEvent("admin_view", undefined, user.id);

  const [
    { count: profilesCount },
    { count: applicationsCount },
    { count: documentsCount },
    { count: aiCount },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("job_applications").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("ai_feedback").select("*", { count: "exact", head: true }),
    supabase
      .from("usage_logs")
      .select("event, props, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">관리자 패널</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {user.email} · JobTrack 사용 현황
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="총 사용자" value={profilesCount ?? 0} />
        <Stat label="총 지원" value={applicationsCount ?? 0} />
        <Stat label="총 문서" value={documentsCount ?? 0} />
        <Stat label="AI 요청" value={aiCount ?? 0} />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-sm font-semibold">최근 활동 로그</p>
        </div>
        {!recentLogs || recentLogs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-400 text-center">
            아직 로그가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentLogs.map((log, i) => (
              <li
                key={i}
                className="px-4 py-2.5 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 flex-shrink-0">
                    {log.event}
                  </span>
                  <span className="text-xs text-zinc-400 truncate font-mono">
                    {log.user_id?.slice(0, 8) ?? "—"}
                  </span>
                </div>
                <span className="text-xs text-zinc-400 flex-shrink-0">
                  {new Date(log.created_at).toLocaleString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-[28px] font-bold tracking-tight">{value}</p>
    </div>
  );
}
