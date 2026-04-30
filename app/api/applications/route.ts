import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type {
  ApplicationRow,
  ApplicationsResponse,
  ApplicationResponse,
  CreateApplicationRequest,
  ApiError,
} from "@/types/application";
import type { ApplicationStatus } from "@/types/database";

type SupabaseApplicationRow = {
  id: string;
  user_id: string;
  company_id: string | null;
  position: string;
  status: ApplicationStatus;
  job_url: string | null;
  salary_range: string | null;
  location: string | null;
  applied_at: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  companies: { name: string } | null;
};

function toApplicationRow(row: SupabaseApplicationRow): ApplicationRow {
  return {
    id: row.id,
    company_id: row.company_id,
    company_name: row.companies?.name ?? "",
    position: row.position,
    status: row.status,
    job_url: row.job_url,
    salary_range: row.salary_range,
    location: row.location,
    applied_at: row.applied_at,
    deadline: row.deadline,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(
  request: NextRequest
): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" } satisfies ApiError, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const statusFilter = searchParams.get("status") as ApplicationStatus | null;

  let query = supabase
    .from("job_applications")
    .select("*, companies(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message } satisfies ApiError, { status: 500 });
  }

  const rows = (data as SupabaseApplicationRow[]).map(toApplicationRow);
  return Response.json({ data: rows, count: count ?? rows.length } satisfies ApplicationsResponse);
}

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" } satisfies ApiError, { status: 401 });
  }

  const body: CreateApplicationRequest = await request.json();

  if (!body.company_name?.trim() || !body.position?.trim()) {
    return Response.json(
      { error: "회사명과 직무명은 필수입니다." } satisfies ApiError,
      { status: 400 }
    );
  }

  // Upsert company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .upsert(
      { user_id: user.id, name: body.company_name.trim() },
      { onConflict: "user_id,name", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (companyError) {
    // If upsert fails (e.g. no unique constraint), try select
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", body.company_name.trim())
      .single();

    const companyId = existing?.id ?? null;

    return insertApplication(supabase, user.id, body, companyId);
  }

  return insertApplication(supabase, user.id, body, company?.id ?? null);
}

async function insertApplication(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: CreateApplicationRequest,
  companyId: string | null
): Promise<Response> {
  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      user_id: userId,
      company_id: companyId,
      position: body.position.trim(),
      status: body.status ?? "wishlist",
      job_url: body.job_url || null,
      salary_range: body.salary_range || null,
      location: body.location || null,
      applied_at: body.applied_at || null,
      deadline: body.deadline || null,
      notes: body.notes || null,
    })
    .select("*, companies(name)")
    .single();

  if (error) {
    return Response.json({ error: error.message } satisfies ApiError, { status: 500 });
  }

  const row = toApplicationRow(data as SupabaseApplicationRow);
  await logEvent("application_create", {
    application_id: row.id,
    status: row.status,
  }, userId);

  return Response.json(
    { data: row } satisfies ApplicationResponse,
    { status: 201 }
  );
}
