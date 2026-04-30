import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type { CalendarEventType, Database } from "@/types/database";

type CalendarEventUpdate =
  Database["public"]["Tables"]["calendar_events"]["Update"];

interface UpdateBody {
  title?: string;
  event_type?: CalendarEventType;
  starts_at?: string;
  ends_at?: string | null;
  description?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  application_id?: string | null;
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/calendar-events/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as UpdateBody;
  const update: CalendarEventUpdate = {};
  if (body.title !== undefined) update.title = body.title.trim();
  if (body.event_type !== undefined) update.event_type = body.event_type;
  if (body.starts_at !== undefined) update.starts_at = body.starts_at;
  if ("ends_at" in body) update.ends_at = body.ends_at || null;
  if ("description" in body) update.description = body.description || null;
  if ("location" in body) update.location = body.location || null;
  if ("meeting_url" in body) update.meeting_url = body.meeting_url || null;
  if ("application_id" in body)
    update.application_id = body.application_id || null;

  const { data, error } = await supabase
    .from("calendar_events")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("calendar_event_update", { event_id: id }, user.id);
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/calendar-events/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("calendar_event_delete", { event_id: id }, user.id);
  return new Response(null, { status: 204 });
}
