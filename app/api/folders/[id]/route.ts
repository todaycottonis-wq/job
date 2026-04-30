import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/folders/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("folder_delete", { folder_id: id }, user.id);
  return new Response(null, { status: 204 });
}
