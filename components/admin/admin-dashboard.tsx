"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface LogRow {
  event: string;
  user_id: string | null;
  created_at: string;
}
interface ProfileRow {
  user_id: string;
  onboarded_at: string | null;
  created_at: string;
}
interface RetentionLogRow {
  user_id: string | null;
  created_at: string;
}
interface AllProfileRow {
  user_id: string;
  created_at: string;
}
interface Stats {
  users: number;
  onboarded: number;
  applications: number;
  documents: number;
  aiRequests: number;
}

const RETENTION_BUCKETS = [1, 3, 7, 14];

const EVENT_COLORS: Record<string, string> = {
  signup: "bg-purple-100 text-purple-700",
  login: "bg-blue-100 text-blue-700",
  logout: "bg-zinc-100 text-zinc-600",
  onboarding_view: "bg-amber-100 text-amber-700",
  onboarding_step: "bg-amber-100 text-amber-700",
  onboarding_skip: "bg-zinc-100 text-zinc-600",
  onboarding_complete: "bg-green-100 text-green-700",
  application_create: "bg-indigo-100 text-indigo-700",
  application_update: "bg-indigo-100 text-indigo-700",
  application_delete: "bg-red-100 text-red-700",
  calendar_event_create: "bg-pink-100 text-pink-700",
  calendar_event_update: "bg-pink-100 text-pink-700",
  calendar_event_delete: "bg-red-100 text-red-700",
  folder_create: "bg-teal-100 text-teal-700",
  folder_delete: "bg-red-100 text-red-700",
  document_create: "bg-cyan-100 text-cyan-700",
  document_update: "bg-cyan-100 text-cyan-700",
  document_delete: "bg-red-100 text-red-700",
  document_upload: "bg-cyan-100 text-cyan-700",
  admin_view: "bg-zinc-100 text-zinc-600",
};

function eventBadgeCls(event: string) {
  return EVENT_COLORS[event] ?? "bg-zinc-100 text-zinc-600";
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

export function AdminDashboard({
  adminEmail,
  stats,
  logs,
  recentUsers,
  lookbackDays,
  allProfiles,
  retentionLogs,
}: {
  adminEmail: string;
  stats: Stats;
  logs: LogRow[];
  recentUsers: ProfileRow[];
  lookbackDays: number;
  allProfiles: AllProfileRow[];
  retentionLogs: RetentionLogRow[];
}) {
  // 일별 시계열: 최근 lookbackDays 일
  const dailySeries = useMemo(() => {
    const days: { date: string; label: string; events: number; users: Set<string> }[] = [];
    const now = new Date();
    for (let i = lookbackDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({
        date: ymd(d),
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        events: 0,
        users: new Set<string>(),
      });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const log of logs) {
      const key = ymd(new Date(log.created_at));
      const i = idx.get(key);
      if (i === undefined) continue;
      days[i].events += 1;
      if (log.user_id) days[i].users.add(log.user_id);
    }
    return days.map((d) => ({
      label: d.label,
      events: d.events,
      activeUsers: d.users.size,
    }));
  }, [logs, lookbackDays]);

  // 이벤트별 집계
  const byEvent = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of logs) {
      map.set(log.event, (map.get(log.event) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [logs]);

  const totalEvents7 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return logs.filter((l) => new Date(l.created_at) >= cutoff).length;
  }, [logs]);

  // 리텐션: 가입 D일째 활동한 유저 / 가입한 지 D일 이상 지난 유저
  const retentionData = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    return RETENTION_BUCKETS.map((d) => {
      const cutoff = now - d * dayMs;
      const eligible = allProfiles.filter(
        (p) => new Date(p.created_at).getTime() <= cutoff
      );
      const active = eligible.filter((p) => {
        const joinTs = new Date(p.created_at).getTime();
        const winStart = joinTs + (d - 0.5) * dayMs;
        const winEnd = joinTs + (d + 0.5) * dayMs;
        return retentionLogs.some((l) => {
          if (l.user_id !== p.user_id) return false;
          const t = new Date(l.created_at).getTime();
          return t >= winStart && t <= winEnd;
        });
      });
      return {
        label: `D${d}`,
        rate:
          eligible.length > 0
            ? Math.round((active.length / eligible.length) * 100)
            : 0,
        active: active.length,
        total: eligible.length,
      };
    });
  }, [allProfiles, retentionLogs]);

  const hasRetentionEligible = retentionData.some((r) => r.total > 0);

  const onboardingRate =
    stats.users === 0 ? 0 : Math.round((stats.onboarded / stats.users) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          관리자 대시보드
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {adminEmail} · 최근 {lookbackDays}일 활동
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Users size={16} className="text-[#3182F6]" />}
          label="총 사용자"
          value={stats.users}
        />
        <StatCard
          icon={<CheckCircle2 size={16} className="text-green-500" />}
          label="온보딩 완료"
          value={`${stats.onboarded}`}
          sub={stats.users > 0 ? `${onboardingRate}%` : undefined}
        />
        <StatCard
          icon={<Briefcase size={16} className="text-indigo-500" />}
          label="총 지원"
          value={stats.applications}
        />
        <StatCard
          icon={<FileText size={16} className="text-cyan-500" />}
          label="총 문서"
          value={stats.documents}
        />
        <StatCard
          icon={<Sparkles size={16} className="text-purple-500" />}
          label="AI 요청"
          value={stats.aiRequests}
        />
      </div>

      {/* 최근 7일 합계 + 차트 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="일별 활동 추이"
            subtitle={`최근 ${lookbackDays}일 · 이벤트 ${logs.length}건 · 7일 ${totalEvents7}건`}
          />
          <div className="px-4 pb-4 h-[260px]">
            {logs.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailySeries}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3182F6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3182F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e4e4e7",
                      fontSize: 12,
                    }}
                    labelStyle={{ fontWeight: 600 }}
                    formatter={(v, name) => [
                      v as number,
                      name === "events" ? "이벤트" : "활성 유저",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#3182F6"
                    strokeWidth={2}
                    fill="url(#fillEvents)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="이벤트 분포" subtitle="발생 횟수 Top 8" />
          <div className="px-4 pb-4 h-[260px]">
            {byEvent.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byEvent}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="event"
                    tick={{ fontSize: 10, fill: "#52525b" }}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e4e4e7",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#3182F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* 리텐션 */}
      <Card>
        <CardHeader
          title="가입 후 리텐션"
          subtitle="가입 D일째 활동한 유저 비율 (최근 30일 데이터)"
        />
        {!hasRetentionEligible ? (
          <p className="px-4 py-8 text-sm text-zinc-400 text-center">
            가입자가 아직 충분히 누적되지 않았습니다. 며칠 더 운영해보세요.
          </p>
        ) : (
          <div className="px-4 pb-4">
            <div className="h-[200px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={retentionData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e4e4e7"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e4e4e7",
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v as number}%`, "리텐션"]}
                  />
                  <Bar
                    dataKey="rate"
                    fill="#3182F6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              {retentionData.map((r) => (
                <div
                  key={r.label}
                  className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 py-2"
                >
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {r.label}
                  </p>
                  <p className="text-base font-bold tracking-tight">{r.rate}%</p>
                  <p className="text-[10px] text-zinc-400">
                    {r.active} / {r.total}명
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 최근 가입 + 활동 로그 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="최근 가입 사용자" subtitle="최대 10명" />
          {recentUsers.length === 0 ? (
            <p className="px-4 py-8 text-sm text-zinc-400 text-center">
              아직 가입자가 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentUsers.map((u) => (
                <li
                  key={u.user_id}
                  className="px-4 py-2.5 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Users size={12} className="text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate">
                        {u.user_id.slice(0, 8)}…
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {u.onboarded_at ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600">
                            <CheckCircle2 size={10} />
                            온보딩 완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
                            <Clock size={10} />
                            온보딩 진행중
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {fmtTime(u.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="실시간 활동" subtitle="최근 30개 이벤트" />
          {logs.length === 0 ? (
            <p className="px-4 py-8 text-sm text-zinc-400 text-center">
              아직 활동이 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[360px] overflow-y-auto">
              {logs.slice(0, 30).map((log, i) => (
                <li
                  key={i}
                  className="px-4 py-2 flex items-center justify-between text-sm gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium flex-shrink-0 ${eventBadgeCls(
                        log.event
                      )}`}
                    >
                      {log.event}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 truncate">
                      {log.user_id?.slice(0, 8) ?? "—"}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 flex-shrink-0">
                    {fmtTime(log.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <p className="text-[26px] font-bold tracking-tight">{value}</p>
        {sub && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="px-4 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
      <p className="text-sm font-semibold">{title}</p>
      {subtitle && (
        <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <p className="text-sm text-zinc-400">데이터가 충분하지 않습니다.</p>
      <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">
        사용자 활동이 쌓이면 여기에 표시됩니다.
      </p>
    </div>
  );
}
