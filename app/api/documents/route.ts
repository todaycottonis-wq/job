import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type { DocumentType } from "@/types/database";

interface CreateBody {
  title: string;
  type: DocumentType;
  content?: string | null;
  file_url?: string | null;
  folder_id?: string | null;
  application_id?: string | null;
}

export async function GET(request: NextRequest): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const folderId = searchParams.get("folder_id"); // 'null'은 미분류

  let query = supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (folderId === "null") {
    query = query.is("folder_id", null);
  } else if (folderId) {
    query = query.eq("folder_id", folderId);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as CreateBody;
  if (!body.title?.trim() || !body.type) {
    return Response.json(
      { error: "title, type은 필수입니다." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      type: body.type,
      content: body.content || null,
      file_url: body.file_url || null,
      folder_id: body.folder_id || null,
      application_id: body.application_id || null,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent(
    "document_create",
    { document_id: data.id, type: body.type },
    user.id
  );
  return Response.json({ data }, { status: 201 });
}
