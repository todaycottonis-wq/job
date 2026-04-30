"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

export async function logOnboardingStep(step: number): Promise<void> {
  await logEvent("onboarding_step", { step });
}

export async function skipOnboarding(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("user_id", user.id);

  await logEvent("onboarding_skip", undefined, user.id);
  redirect("/");
}

export async function completeOnboarding(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("user_id", user.id);

  await logEvent("onboarding_complete", undefined, user.id);
  redirect("/applications");
}
