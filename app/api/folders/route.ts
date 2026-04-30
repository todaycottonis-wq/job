import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

interface CreateBody {
  name: string;
  emoji?: string | null;
}

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

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
  if (!body.name?.trim())
    return Response.json({ error: "폴더명은 필수입니다." }, { status: 400 });

  const { data, error } = await supabase
    .from("folders")
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      emoji: body.emoji || null,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("folder_create", { folder_id: data.id }, user.id);
  return Response.json({ data }, { status: 201 });
}
