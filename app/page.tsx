import Link from "next/link";
import {
  Briefcase,
  CalendarCheck,
  Award,
  TrendingUp,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { DDayBadge } from "@/components/ui/dday-badge";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types/application";
import type { ApplicationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const IN_PROGRESS_STATUSES: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
];

interface RecentApp {
  id: string;
  status: ApplicationStatus;
  position: string;
  applied_at: string | null;
  deadline: string | null;
  updated_at: string;
  companies: { name: string } | null;
}

interface UpcomingEvent {
  id: string;
  title: string;
  starts_at: string;
  event_type: string;
  location: string | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    { count: totalCount },
    { count: inProgressCount },
    { count: interviewCount },
    { count: offerCount },
    { count: thisMonthCount },
    { data: recentApps },
    { data: upcoming },
    { data: allStatuses },
    { data: monthlyApps },
  ] = await Promise.all([
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", IN_PROGRESS_STATUSES),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "interview"),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "offer"),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("job_applications")
      .select("id, status, position, applied_at, deadline, updated_at, companies(name)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("calendar_events")
      .select("id, title, starts_at, event_type, location")
      .eq("user_id", user.id)
      .gte("starts_at", now.toISOString())
      .lte("starts_at", sevenDaysLater.toISOString())
      .order("starts_at", { ascending: true })
      .limit(5),
    supabase
      .from("job_applications")
      .select("status")
      .eq("user_id", user.id),
    supabase
      .from("job_applications")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", sixMonthsAgo.toISOString()),
  ]);

  // 상태별 분포 집계
  const statusBreakdown: { status: ApplicationStatus; count: number }[] = (
    [
      "wishlist",
      "applied",
      "screening",
      "interview",
      "offer",
      "rejected",
      "withdrawn",
    ] as ApplicationStatus[]
  ).map((s) => ({
    status: s,
    count:
      (allStatuses ?? []).filter(
        (a) => (a as { status: ApplicationStatus }).status === s
      ).length,
  }));

  const monthlySource = (monthlyApps ?? []).map((m) => ({
    date: (m as { created_at: string }).created_at,
  }));

  const total = totalCount ?? 0;
  const isEmpty = total === 0;

  return (
    <div className="p-5 sm:p-6 max-w-5xl mx-auto pl-14 md:pl-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {isEmpty
            ? "커리업에 오신 걸 환영해요. 첫 지원부터 등록해볼까요?"
            : "지원 현황과 다가오는 일정을 한눈에 보세요."}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Briefcase size={16} className="text-[#3182F6]" />}
          label="진행 중"
          value={inProgressCount ?? 0}
          sub={total > 0 ? `전체 ${total}건` : undefined}
        />
        <StatCard
          icon={<CalendarCheck size={16} className="text-purple-500" />}
          label="면접 예정"
          value={interviewCount ?? 0}
          sub="현재 면접 단계"
        />
        <StatCard
          icon={<Award size={16} className="text-green-500" />}
          label="최종 합격"
          value={offerCount ?? 0}
          sub={
            total > 0
              ? `합격률 ${Math.round(((offerCount ?? 0) / total) * 100)}%`
              : undefined
          }
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-amber-500" />}
          label="이번 달 지원"
          value={thisMonthCount ?? 0}
          sub="최근 30일"
        />
      </div>

      {!isEmpty && (
        <div className="mt-6">
          <DashboardCharts
            statusBreakdown={statusBreakdown}
            monthlySource={monthlySource}
          />
        </div>
      )}

      {isEmpty ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#3182F6]/10 flex items-center justify-center mb-4">
            <Briefcase size={20} className="text-[#3182F6]" />
          </div>
          <p className="text-base font-semibold mb-1">아직 지원 내역이 없어요</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
            관심 회사를 위시리스트에 담아두는 것부터 시작해도 좋아요.
          </p>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3182F6] hover:bg-[#1a6fe8] active:bg-[#1560d4] transition-colors px-5 py-2.5 text-sm font-semibold text-white"
          >
            첫 지원 추가하기
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader title="최근 지원" link="/applications" linkLabel="전체 보기" />
            {!recentApps || recentApps.length === 0 ? (
              <p className="px-4 py-8 text-sm text-zinc-400 text-center">
                지원 내역이 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {(recentApps as unknown as RecentApp[]).map((app) => (
                  <li key={app.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {app.companies?.name ?? "—"}
                        <span className="text-zinc-400 font-normal ml-1.5">· {app.position}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </span>
                        {app.deadline && <DDayBadge date={app.deadline} prefix="마감 D" />}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="이번 주 일정" link="/calendar" linkLabel="캘린더" />
            {!upcoming || upcoming.length === 0 ? (
              <p className="px-4 py-8 text-sm text-zinc-400 text-center">
                예정된 일정이 없어요.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {(upcoming as UpcomingEvent[]).map((ev) => (
                  <li key={ev.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate flex-1">{ev.title}</p>
                      <DDayBadge date={ev.starts_at} />
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(ev.starts_at).toLocaleString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {ev.location && ` · ${ev.location}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {!isEmpty && (
        <div className="mt-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-[#3182F6]/5 to-transparent p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3182F6]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-[#3182F6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5">
                {(thisMonthCount ?? 0) >= 5
                  ? "이번 달 활발하게 지원했어요"
                  : (thisMonthCount ?? 0) === 0
                  ? "이번 달 지원이 잠잠했네요"
                  : "꾸준히 지원하고 있어요"}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                최근 30일에 {thisMonthCount ?? 0}건 지원 ·{" "}
                {(interviewCount ?? 0) > 0
                  ? `현재 ${interviewCount}건 면접 진행 중`
                  : `면접 단계 ${interviewCount ?? 0}건`}
                {(offerCount ?? 0) > 0 ? ` · 합격 ${offerCount}건 🎉` : ""}
              </p>
            </div>
          </div>
        </div>
      )}
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
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-[26px] font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
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
    <div className={`rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  title,
  link,
  linkLabel,
}: {
  title: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
      <p className="text-sm font-semibold">{title}</p>
      {link && linkLabel && (
        <Link
          href={link}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 inline-flex items-center gap-0.5 transition-colors"
        >
          {linkLabel}
          <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}
