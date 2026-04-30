import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 이미 온보딩 끝낸 유저는 차단 (직접 URL 진입 케이스)
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded_at")
    .eq("user_id", user.id)
    .single();

  if (profile?.onboarded_at) redirect("/");

  await logEvent("onboarding_view", undefined, user.id);

  return <OnboardingWizard />;
}
