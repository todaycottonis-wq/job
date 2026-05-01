import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

/** 한 지원에 연결된 문서 ID 목록 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]/documents">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 본인 application인지 확인
  const { data: app } = await supabase
    .from("job_applications")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!app) return Response.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("application_documents")
    .select("document_id, documents(id, title, type, file_url)")
    .eq("application_id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

/** 한 지원의 연결 문서 전체 교체 (PUT) */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]/documents">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: app } = await supabase
    .from("job_applications")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!app) return Response.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as { document_ids?: string[] };
  const docIds = Array.isArray(body.document_ids) ? body.document_ids : [];

  // 모두 삭제 후 새로 insert (단순 교체)
  await supabase.from("application_documents").delete().eq("application_id", id);

  if (docIds.length > 0) {
    const rows = docIds.map((doc_id) => ({
      application_id: id,
      document_id: doc_id,
    }));
    const { error } = await supabase.from("application_documents").insert(rows);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, count: docIds.length });
}
