import { createClient } from "@/lib/supabase-server";

interface RateLimitResult {
  allowed: boolean;
  used: number;
  limit: number;
  resetAt: Date;
}

/**
 * usage_logs 기반 단순 슬라이딩 윈도우 rate limit.
 * 같은 user_id + event 가 windowMs 안에 limit 회 이상이면 차단.
 *
 * 호출 전에 INSERT 하지 않음 (호출하는 쪽에서 logEvent로 기록).
 */
export async function checkRateLimit(opts: {
  userId: string;
  event: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const supabase = await createClient();
  const since = new Date(Date.now() - opts.windowMs);

  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", opts.userId)
    .eq("event", opts.event)
    .gte("created_at", since.toISOString());

  const used = count ?? 0;
  return {
    allowed: used < opts.limit,
    used,
    limit: opts.limit,
    resetAt: new Date(since.getTime() + opts.windowMs),
  };
}

/** 24시간 N회 무료 정책 — D4 AI 분석 호출에서 사용 예정 */
export function checkAiQuotaToday(userId: string) {
  return checkRateLimit({
    userId,
    event: "ai_request",
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
  });
}
