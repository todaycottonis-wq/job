import { redirect } from "next/navigation";
import {
  User,
  Palette,
  Bell,
  Download,
  FileText,
  Shield,
  MessageSquare,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { DangerZone } from "@/components/settings/danger-zone";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await logEvent("settings_view", undefined, user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at, onboarded_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="p-5 sm:p-6 max-w-3xl mx-auto pl-14 md:pl-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">환경설정</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          계정 정보, 화면 모드, 데이터 관리
        </p>
      </div>

      {/* 계정 정보 */}
      <Section icon={<User size={14} />} title="계정 정보">
        <Row label="이메일" value={user.email ?? "—"} />
        <Row label="가입일" value={joinedAt} />
        <Row
          label="회원 ID"
          value={
            <span className="font-mono text-xs">
              {user.id.slice(0, 8)}…{user.id.slice(-4)}
            </span>
          }
        />
        <Row
          label="온보딩"
          value={
            profile?.onboarded_at ? (
              <span className="text-green-600 dark:text-green-400 text-xs font-semibold">
                완료
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
                미완료
              </span>
            )
          }
        />
      </Section>

      {/* 화면 모드 */}
      <Section icon={<Palette size={14} />} title="화면 모드">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          시스템은 OS 설정을 따라갑니다.
        </p>
        <ThemeToggle />
      </Section>

      {/* 알림 (출시 예정) */}
      <Section
        icon={<Bell size={14} />}
        title="알림"
        badge={
          <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5">
            출시 예정
          </span>
        }
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          면접 1시간 전 푸시, 마감일 D-3 이메일 알림 등 옵션을 곧 제공할 예정이에요.
        </p>
      </Section>

      {/* 데이터 내보내기 */}
      <Section icon={<Download size={14} />} title="데이터 내보내기">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          현재 등록한 지원 내역을 CSV(엑셀) 파일로 받아보세요. 백업이나 외부 정리에 유용해요.
        </p>
        <a
          href="/api/applications/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <FileText size={13} />
          CSV로 내보내기
        </a>
      </Section>

      {/* 위험 영역 */}
      <DangerZone />

      {/* 피드백 */}
      <Section icon={<MessageSquare size={14} />} title="피드백 보내기">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          버그, 개선 아이디어, 출시 요청 무엇이든 환영입니다.
        </p>
        <a
          href={`mailto:today.cotton.is@gmail.com?subject=${encodeURIComponent("[커리업 피드백]")}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] px-3.5 py-2 text-xs font-semibold text-white transition-colors"
        >
          <MessageSquare size={13} />
          이메일로 보내기
        </a>
      </Section>

      {/* 정보 */}
      <Section icon={<Info size={14} />} title="정보">
        <Row label="버전" value="Beta 0.1" />
        <Row
          label="이용약관"
          value={
            <a
              href="/terms"
              className="text-xs text-[#3182F6] hover:underline"
            >
              보기 →
            </a>
          }
        />
        <Row
          label="개인정보 처리방침"
          value={
            <a
              href="/privacy"
              className="text-xs text-[#3182F6] hover:underline"
            >
              보기 →
            </a>
          }
        />
      </Section>

      <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
        <Shield size={11} />
        <span>모든 데이터는 본인 계정으로만 접근 가능합니다 (RLS).</span>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
          {icon}
        </div>
        <h2 className="text-sm font-semibold flex-1">{title}</h2>
        {badge}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-right">
        {value}
      </span>
    </div>
  );
}
