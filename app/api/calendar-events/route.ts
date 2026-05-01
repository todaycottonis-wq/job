import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type { CalendarEventType } from "@/types/database";

interface CreateBody {
  title: string;
  event_type: CalendarEventType;
  user_event_type_id?: string | null;
  starts_at: string; // ISO
  ends_at?: string | null;
  description?: string | null;
  location?: string | null;
  meeting_url?: string | null;
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
  const from = searchParams.get("from"); // ISO YYYY-MM-DD
  const to = searchParams.get("to");

  let query = supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .order("starts_at", { ascending: true });

  if (from) query = query.gte("starts_at", from);
  if (to) query = query.lt("starts_at", to);

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
  if (!body.title?.trim() || !body.event_type || !body.starts_at) {
    return Response.json(
      { error: "title, event_type, starts_at은 필수입니다." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      event_type: body.event_type,
      user_event_type_id: body.user_event_type_id || null,
      starts_at: body.starts_at,
      ends_at: body.ends_at || null,
      description: body.description || null,
      location: body.location || null,
      meeting_url: body.meeting_url || null,
      application_id: body.application_id || null,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logEvent(
    "calendar_event_create",
    { event_id: data.id, event_type: body.event_type },
    user.id
  );

  return Response.json({ data }, { status: 201 });
}
