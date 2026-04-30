import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return Response.json({ error: "file이 필요합니다." }, { status: 400 });

  if (file.size > MAX_BYTES)
    return Response.json(
      { error: "10MB 이하 파일만 업로드 가능합니다." },
      { status: 400 }
    );

  if (!ALLOWED_MIME.has(file.type))
    return Response.json(
      { error: "PDF, PNG, JPG만 지원합니다." },
      { status: 400 }
    );

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: file.type });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logEvent(
    "document_upload",
    { path, size: file.size, mime: file.type },
    user.id
  );

  return Response.json({ path });
}
