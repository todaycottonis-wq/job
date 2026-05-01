import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type { Database } from "@/types/database";

type QuestionUpdate =
  Database["public"]["Tables"]["essay_questions"]["Update"];

interface UpdateBody {
  content?: string;
  char_limit?: number;
  count_mode?: "with_spaces" | "without_spaces";
  answer?: string;
}

async function ownsEssay(
  supabase: Awaited<ReturnType<typeof createClient>>,
  essayId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("essays")
    .select("id")
    .eq("id", essayId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/essays/[id]/questions/[qid]">
): Promise<Response> {
  const { id: essayId, qid } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await ownsEssay(supabase, essayId, user.id)))
    return Response.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as UpdateBody;
  const update: QuestionUpdate = {};
  if (body.content !== undefined) update.content = body.content;
  if (body.char_limit !== undefined) update.char_limit = body.char_limit;
  if (body.count_mode !== undefined) update.count_mode = body.count_mode;
  if (body.answer !== undefined) update.answer = body.answer;

  const { data, error } = await supabase
    .from("essay_questions")
    .update(update)
    .eq("id", qid)
    .eq("essay_id", essayId)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  // 자동저장이 잦으니 로그는 너무 자주 쌓이지 않게 — content 수정만 기록
  if (body.content !== undefined) {
    await logEvent(
      "essay_question_update",
      { essay_id: essayId, question_id: qid },
      user.id
    );
  }
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/essays/[id]/questions/[qid]">
): Promise<Response> {
  const { id: essayId, qid } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await ownsEssay(supabase, essayId, user.id)))
    return Response.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase
    .from("essay_questions")
    .delete()
    .eq("id", qid)
    .eq("essay_id", essayId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent(
    "essay_question_delete",
    { essay_id: essayId, question_id: qid },
    user.id
  );
  return new Response(null, { status: 204 });
}
