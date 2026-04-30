"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

const ONB_COOKIE = "jt_onb";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  await logEvent("login", undefined, data.user?.id);

  // 신규 유저는 proxy.ts가 /onboarding으로 보내고, 기존 유저는 /로 진입
  redirect("/");
}

export async function signup(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  // 가입 직후 세션이 부여된 경우(이메일 인증 OFF 상태)에만 즉시 적재됨.
  // 인증 ON 상태라면 RLS로 막히고 silent fail — 트리거에서 profiles는 이미 생성되어 있음.
  if (data.user) {
    await logEvent("signup", { email }, data.user.id);
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await logEvent("logout");
  await supabase.auth.signOut();
  // 다른 유저로 로그인 시 캐시 충돌 방지
  (await cookies()).delete(ONB_COOKIE);
  redirect("/login");
}
