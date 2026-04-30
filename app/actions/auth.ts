"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import { koreanizeAuthError } from "@/lib/auth-errors";

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
    return { error: koreanizeAuthError(error.message) };
  }

  await logEvent("login", undefined, data.user?.id);
  redirect("/");
}

export async function signup(
  _prevState: { error?: string; info?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해주세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 해요." };
  }

  // 인증 메일의 redirect URL을 현재 호스트 기반으로 (vercel preview/production 둘 다 대응)
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `https://${(await headers()).get("host") ?? "job-kappa-coral.vercel.app"}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/login`,
    },
  });

  if (error) {
    return { error: koreanizeAuthError(error.message) };
  }

  // Supabase는 이미 가입된 이메일로 signUp 시 보안상 user 객체는 반환하지만
  // identities는 빈 배열로 둠. 이걸로 중복 가입 감지.
  if (
    data.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    return {
      error:
        "이미 가입된 이메일이에요. 로그인하거나 비밀번호 찾기를 이용해주세요.",
    };
  }

  if (data.user) {
    await logEvent("signup", { email }, data.user.id);
  }

  // 이메일 인증 ON이면 session 없이 user만 반환됨 → 인증 메일 안내 메시지
  if (!data.session) {
    return {
      info: "인증 메일을 보냈어요. 메일함에서 링크를 눌러 가입을 완료해주세요. (스팸함도 확인!)",
    };
  }

  redirect("/");
}

export async function requestPasswordReset(
  _prevState: { error?: string; info?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "이메일을 입력해주세요." };
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `https://${(await headers()).get("host") ?? "job-kappa-coral.vercel.app"}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { error: koreanizeAuthError(error.message) };
  }

  // 보안상 가입 여부와 무관하게 같은 메시지 반환
  return {
    info:
      "메일을 보냈어요. 받으신 링크를 눌러 새 비밀번호를 설정해주세요. (가입된 이메일이라면 5분 안에 도착해요)",
  };
}

export async function updatePassword(
  _prevState: { error?: string; info?: string } | undefined,
  formData: FormData
) {
  const password = formData.get("password") as string;
  if (!password || password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 해요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: koreanizeAuthError(error.message) };

  redirect("/login?reset=ok");
}

export async function logout() {
  const supabase = await createClient();
  await logEvent("logout");
  await supabase.auth.signOut();
  (await cookies()).delete(ONB_COOKIE);
  redirect("/login");
}
