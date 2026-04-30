import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type { DocumentType, Database } from "@/types/database";

type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

interface UpdateBody {
  title?: string;
  type?: DocumentType;
  content?: string | null;
  folder_id?: string | null;
  application_id?: string | null;
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/documents/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as UpdateBody;
  const update: DocumentUpdate = {};
  if (body.title !== undefined) update.title = body.title.trim();
  if (body.type !== undefined) update.type = body.type;
  if ("content" in body) update.content = body.content || null;
  if ("folder_id" in body) update.folder_id = body.folder_id || null;
  if ("application_id" in body)
    update.application_id = body.application_id || null;

  const { data, error } = await supabase
    .from("documents")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("document_update", { document_id: id }, user.id);
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/documents/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // file_url이 storage path면 같이 삭제 (best-effort)
  const { data: doc } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (doc?.file_url && doc.file_url.startsWith(user.id + "/")) {
    await supabase.storage.from("documents").remove([doc.file_url]);
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("document_delete", { document_id: id }, user.id);
  return new Response(null, { status: 204 });
}
