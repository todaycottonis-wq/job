import { requireAdmin } from "@/lib/admin";
import { logEvent } from "@/lib/logger";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const LOOKBACK_DAYS = 14;

export default async function AdminPage() {
  const { supabase, user } = await requireAdmin();

  await logEvent("admin_view", undefined, user.id);

  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);
  const sinceIso = since.toISOString();

  const [
    { count: profilesCount },
    { count: applicationsCount },
    { count: documentsCount },
    { count: aiCount },
    { data: recentLogs },
    { data: recentProfiles },
    { count: onboardedCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("job_applications").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("ai_feedback").select("*", { count: "exact", head: true }),
    supabase
      .from("usage_logs")
      .select("event, user_id, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("user_id, onboarded_at, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("onboarded_at", "is", null),
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
    />
  );
}
