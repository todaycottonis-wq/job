import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * 문서의 storage 파일에 대한 signed URL 발급 (10분 유효).
 * file_url이 외부 링크(http://...)면 그대로 반환.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/documents/[id]/url">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select("file_url, type, title")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (docErr || !doc)
    return Response.json({ error: "Not found" }, { status: 404 });

  if (!doc.file_url) {
    return Response.json({ error: "파일이 없는 문서입니다." }, { status: 400 });
  }

  // 외부 URL (노션 등)이면 그대로
  if (/^https?:\/\//i.test(doc.file_url)) {
    return Response.json({ url: doc.file_url, external: true });
  }

  // storage path → signed URL
  const { data: signed, error: sErr } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_url, 600);

  if (sErr || !signed)
    return Response.json(
      { error: sErr?.message ?? "URL 생성 실패" },
      { status: 500 }
    );

  return Response.json({ url: signed.signedUrl, external: false });
}
