import { createClient } from "@/lib/supabase-server";

interface JoinedRow {
  application_id: string;
  document_id: string;
  documents: {
    id: string;
    title: string;
    type: string;
    file_url: string | null;
  } | null;
}

export interface AppDocSummary {
  id: string;
  title: string;
  type: string;
  file_url: string | null;
  is_link: boolean;
}

/** 본인 모든 application_documents를 application_id 기준으로 그룹화해 반환 */
export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 본인 application들만 가져오기 위해 join (RLS도 보장하지만 한 쿼리로)
  const { data: apps } = await supabase
    .from("job_applications")
    .select("id")
    .eq("user_id", user.id);

  const appIds = (apps ?? []).map((a) => a.id);
  if (appIds.length === 0) return Response.json({ data: {} });

  const { data, error } = await supabase
    .from("application_documents")
    .select(
      "application_id, document_id, documents(id, title, type, file_url)"
    )
    .in("application_id", appIds);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const grouped: Record<string, AppDocSummary[]> = {};
  for (const row of (data as unknown as JoinedRow[]) ?? []) {
    if (!row.documents) continue;
    const arr = grouped[row.application_id] ?? [];
    arr.push({
      id: row.documents.id,
      title: row.documents.title,
      type: row.documents.type,
      file_url: row.documents.file_url,
      is_link: !!(
        row.documents.file_url && /^https?:\/\//i.test(row.documents.file_url)
      ),
    });
    grouped[row.application_id] = arr;
  }

  return Response.json({ data: grouped });
}
