import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type { Database } from "@/types/database";

type EssayUpdate = Database["public"]["Tables"]["essays"]["Update"];

interface UpdateBody {
  company_name?: string;
  job_title?: string;
  jd_url?: string | null;
  applied_date?: string | null;
  deadline?: string | null;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/essays/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("essays")
    .select(
      "id, company_name, job_title, jd_url, applied_date, deadline, created_at, updated_at, essay_questions(*)"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data)
    return Response.json({ error: "Not found" }, { status: 404 });

  // 문항 order 정렬
  const row = data as unknown as {
    essay_questions: { order: number }[];
    [key: string]: unknown;
  };
  const sorted = {
    ...row,
    essay_questions: [...(row.essay_questions ?? [])].sort(
      (a, b) => a.order - b.order
    ),
  };
  return Response.json({ data: sorted });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/essays/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as UpdateBody;
  const update: EssayUpdate = {};
  if (body.company_name !== undefined)
    update.company_name = body.company_name.trim();
  if (body.job_title !== undefined) update.job_title = body.job_title.trim();
  if ("jd_url" in body) update.jd_url = body.jd_url || null;
  if ("applied_date" in body) update.applied_date = body.applied_date || null;
  if ("deadline" in body) update.deadline = body.deadline || null;

  const { data, error } = await supabase
    .from("essays")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("essay_update", { essay_id: id }, user.id);
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/essays/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("essays")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("essay_delete", { essay_id: id }, user.id);
  return new Response(null, { status: 204 });
}
