"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  APPLICATION_STATUS_LABELS,
} from "@/types/application";
import type { ApplicationStatus } from "@/types/database";

interface StatusItem {
  status: ApplicationStatus;
  count: number;
}
interface MonthlyItem {
  date: string; // YYYY-MM-DD (created_at)
}

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  wishlist: "#a1a1aa",
  applied: "#3b82f6",
  screening: "#eab308",
  interview: "#a855f7",
  offer: "#22c55e",
  rejected: "#ef4444",
  withdrawn: "#71717a",
};

interface Props {
  statusBreakdown: StatusItem[];
  monthlySource: MonthlyItem[];
}

export function DashboardCharts({ statusBreakdown, monthlySource }: Props) {
  // 도넛 데이터 (count 0 제외)
  const pieData = useMemo(() => {
    return statusBreakdown
      .filter((s) => s.count > 0)
      .map((s) => ({
        name: APPLICATION_STATUS_LABELS[s.status],
        value: s.count,
        color: STATUS_COLOR[s.status],
      }));
  }, [statusBreakdown]);

  // 월별 시계열 (최근 6개월)
  const monthlyData = useMemo(() => {
    const months: { key: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${d.getMonth() + 1}월`;
      months.push({ key, label, count: 0 });
    }
    const idx = new Map(months.map((m, i) => [m.key, i]));
    for (const item of monthlySource) {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const i = idx.get(key);
      if (i !== undefined) months[i].count += 1;
    }
    return months;
  }, [monthlySource]);

  const total = pieData.reduce((s, d) => s + d.value, 0);
  const hasData = total > 0 || monthlySource.length > 0;
  if (!hasData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 도넛: 상태별 분포 */}
      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-1">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-sm font-semibold">진행 상태 분포</p>
          <p className="text-xs text-zinc-400 mt-0.5">전체 {total}건 기준</p>
        </div>
        <div className="px-4 pb-4 pt-2 h-[220px]">
          {pieData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-zinc-400">데이터가 없습니다.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e4e4e7",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {pieData.length > 0 && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-1.5">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-zinc-600 dark:text-zinc-400 truncate">
                  {d.name}
                </span>
                <span className="ml-auto font-semibold tabular-nums">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 월별 추이 area */}
      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-2">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-sm font-semibold">월별 지원 추이</p>
          <p className="text-xs text-zinc-400 mt-0.5">최근 6개월</p>
        </div>
        <div className="px-4 pb-4 pt-2 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
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
                formatter={(v) => [v as number, "지원"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3182F6"
                strokeWidth={2}
                fill="url(#dashFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
