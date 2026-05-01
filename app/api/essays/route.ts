import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";

interface CreateBody {
  company_name: string;
  job_title: string;
  jd_url?: string | null;
  applied_date?: string | null;
  deadline?: string | null;
}

/** 본인 essays + 각 essay의 문항 카운트(완성/전체) 같이 조회 */
export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // essays + 각 essay의 question 목록 (count + completion 계산용 answer 길이만)
  const { data, error } = await supabase
    .from("essays")
    .select(
      "id, company_name, job_title, jd_url, applied_date, deadline, created_at, updated_at, essay_questions(id, answer)"
    )
    .eq("user_id", user.id)
    .order("deadline", { ascending: true, nullsFirst: false });

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
  if (!body.company_name?.trim() || !body.job_title?.trim()) {
    return Response.json(
      { error: "회사명과 직무명은 필수입니다." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("essays")
    .insert({
      user_id: user.id,
      company_name: body.company_name.trim(),
      job_title: body.job_title.trim(),
      jd_url: body.jd_url || null,
      applied_date: body.applied_date || null,
      deadline: body.deadline || null,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await logEvent("essay_create", { essay_id: data.id }, user.id);
  return Response.json({ data }, { status: 201 });
}
