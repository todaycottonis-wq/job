import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { logEvent } from "@/lib/logger";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const LOOKBACK_DAYS = 14;

export default async function AdminPage() {
  const { user } = await requireAdmin();
  await logEvent("admin_view", undefined, user.id);

  // RLS 우회로 모든 유저 데이터 조회 (admin email 통과 후에만)
  const admin = createAdminClient();

  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);
  const sinceIso = since.toISOString();

  // 리텐션 계산용 (D1·D3·D7·D14 까지 보려면 더 긴 lookback)
  const RETENTION_LOOKBACK = 30;
  const retentionSince = new Date();
  retentionSince.setDate(retentionSince.getDate() - RETENTION_LOOKBACK);

  const [
    { count: profilesCount },
    { count: applicationsCount },
    { count: documentsCount },
    { count: aiCount },
    { data: recentLogs },
    { data: recentProfiles },
    { count: onboardedCount },
    { data: allProfiles },
    { data: retentionLogs },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("job_applications").select("*", { count: "exact", head: true }),
    admin.from("documents").select("*", { count: "exact", head: true }),
    admin.from("ai_feedback").select("*", { count: "exact", head: true }),
    admin
      .from("usage_logs")
      .select("event, user_id, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("user_id, onboarded_at, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("onboarded_at", "is", null),
    admin.from("profiles").select("user_id, created_at"),
    admin
      .from("usage_logs")
      .select("user_id, created_at")
      .gte("created_at", retentionSince.toISOString()),
  ]);

  return (
    <AdminDashboard
      adminEmail={user.email ?? ""}
      stats={{
        users: profilesCount ?? 0,
        onboarded: onboardedCount ?? 0,
        applications: applicationsCount ?? 0,
        documents: documentsCount ?? 0,
        aiRequests: aiCount ?? 0,
      }}
      logs={recentLogs ?? []}
      recentUsers={recentProfiles ?? []}
      lookbackDays={LOOKBACK_DAYS}
      allProfiles={allProfiles ?? []}
      retentionLogs={retentionLogs ?? []}
    />
  );
}
