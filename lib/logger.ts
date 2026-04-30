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
  | "application_delete";

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
