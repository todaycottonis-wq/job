import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

interface ReorderBody {
  /** 새 순서로 정렬된 question id 배열 */
  ids: string[];
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/essays/[id]/questions/reorder">
): Promise<Response> {
  const { id: essayId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: essay } = await supabase
    .from("essays")
    .select("id")
    .eq("id", essayId)
    .eq("user_id", user.id)
    .single();
  if (!essay) return Response.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as ReorderBody;
  if (!Array.isArray(body.ids)) {
    return Response.json({ error: "ids 배열이 필요합니다." }, { status: 400 });
  }

  // 한 번에 update — UPDATE ... CASE WHEN id THEN order 패턴은 supabase JS에서
  // 직접 지원 안 하므로 individual updates를 Promise.all로
  await Promise.all(
    body.ids.map((id, idx) =>
      supabase
        .from("essay_questions")
        .update({ order: idx })
        .eq("id", id)
        .eq("essay_id", essayId)
    )
  );

  await logEvent(
    "essay_question_reorder",
    { essay_id: essayId, count: body.ids.length },
    user.id
  );
  return Response.json({ ok: true });
}
