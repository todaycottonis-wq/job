import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

interface CreateBody {
  content?: string;
  char_limit?: number;
  count_mode?: "with_spaces" | "without_spaces";
}

/** 새 문항 추가 — order는 기존 max + 1 자동 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/essays/[id]/questions">
): Promise<Response> {
  const { id: essayId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 본인 essay 확인
  const { data: essay } = await supabase
    .from("essays")
    .select("id")
    .eq("id", essayId)
    .eq("user_id", user.id)
    .single();
  if (!essay) return Response.json({ error: "Not found" }, { status: 404 });

  // 다음 order 계산
  const { data: maxRow } = await supabase
    .from("essay_questions")
    .select("order")
    .eq("essay_id", essayId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.order ?? -1) + 1;

  const body = ((await request.json().catch(() => ({}))) ?? {}) as CreateBody;

  const { data, error } = await supabase
    .from("essay_questions")
    .insert({
      essay_id: essayId,
      order: nextOrder,
      content: body.content ?? "",
      char_limit: body.char_limit ?? 500,
      count_mode: body.count_mode ?? "with_spaces",
      answer: "",
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent(
    "essay_question_create",
    { essay_id: essayId, question_id: data.id },
    user.id
  );
  return Response.json({ data }, { status: 201 });
}
