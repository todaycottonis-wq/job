"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

const ONB_COOKIE = "jt_onb";
const ONB_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

async function setOnboardedCookie(userId: string) {
  const store = await cookies();
  store.set(ONB_COOKIE, userId, {
    maxAge: ONB_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

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

  await setOnboardedCookie(user.id);
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

  await setOnboardedCookie(user.id);
  await logEvent("onboarding_complete", undefined, user.id);
  redirect("/applications");
}
