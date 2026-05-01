import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/event-types/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("user_event_types")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
