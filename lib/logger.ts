import { createClient } from "@/lib/supabase-server";

export type UsageEvent =
  | "signup"
  | "login"
  | "logout"
  | "onboarding_view"
  | "onboarding_step"
  | "onboarding_skip"
  | "onboarding_complete"
  | "application_create"
  | "application_update"
  | "application_delete"
  | "calendar_event_create"
  | "calendar_event_update"
  | "calendar_event_delete"
  | "folder_create"
  | "folder_delete"
  | "document_create"
  | "document_update"
  | "document_delete"
  | "document_upload"
  | "admin_view"
  | "settings_view"
  | "data_reset"
  | "account_delete"
  | "data_export"
  | "theme_change";

export async function logEvent(
  event: UsageEvent,
  props?: Record<string, unknown>,
  userIdOverride?: string
): Promise<void> {
  try {
    const supabase = await createClient();

    let userId = userIdOverride;
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    }
    if (!userId) return;

    await supabase.from("usage_logs").insert({
      user_id: userId,
      event,
      props: (props ?? null) as never,
    });
  } catch {
    // fire-and-forget — 분석 로그 실패가 사용자 흐름을 막지 않도록
  }
}
