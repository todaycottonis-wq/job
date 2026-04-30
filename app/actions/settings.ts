"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { logEvent } from "@/lib/logger";

const ONB_COOKIE = "jt_onb";

async function clearStorageFolder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: files } = await supabase.storage
    .from("documents")
    .list(userId);
  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from("documents").remove(paths);
  }
}

/**
 * 본인 데이터 전부 삭제하지만 계정은 살림.
 */
export async function resetAllData(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 데이터 row 삭제 (RLS 통과)
  await Promise.all([
    supabase.from("calendar_events").delete().eq("user_id", user.id),
    supabase.from("documents").delete().eq("user_id", user.id),
    supabase.from("folders").delete().eq("user_id", user.id),
    supabase.from("ai_feedback").delete().eq("user_id", user.id),
    supabase.from("job_applications").delete().eq("user_id", user.id),
    supabase.from("companies").delete().eq("user_id", user.id),
  ]);

  // 업로드된 파일도 삭제 (best-effort)
  await clearStorageFolder(supabase, user.id);

  await logEvent("data_reset", undefined, user.id);
  redirect("/");
}

/**
 * 계정 영구 삭제 (모든 데이터 + auth 유저 row).
 * profiles는 ON DELETE CASCADE로 자동 정리됨.
 */
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // storage 비움
  await clearStorageFolder(supabase, user.id);

  await logEvent("account_delete", undefined, user.id);

  // admin client로 auth 유저 삭제 → cascade 로 나머지 정리
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);

  await supabase.auth.signOut();
  (await cookies()).delete(ONB_COOKIE);
  redirect("/login");
}

export async function logThemeChange(theme: string): Promise<void> {
  await logEvent("theme_change", { theme });
}
