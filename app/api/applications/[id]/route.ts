import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import type {
  ApplicationRow,
  ApplicationResponse,
  UpdateApplicationRequest,
  ApiError,
} from "@/types/application";
import type { ApplicationStatus, Database } from "@/types/database";

type JobApplicationUpdate =
  Database["public"]["Tables"]["job_applications"]["Update"];

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

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" } satisfies ApiError, { status: 401 });
  }

  // Ownership check
  const { data: existing } = await supabase
    .from("job_applications")
    .select("id, user_id, company_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return Response.json({ error: "Not found" } satisfies ApiError, { status: 404 });
  }

  const body: UpdateApplicationRequest = await request.json();

  let companyId: string | null = existing.company_id;

  if (body.company_name !== undefined) {
    const trimmed = body.company_name.trim();
    if (trimmed) {
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", trimmed)
        .single();

      if (company) {
        companyId = company.id;
      } else {
        const { data: newCompany } = await supabase
          .from("companies")
          .insert({ user_id: user.id, name: trimmed })
          .select("id")
          .single();
        companyId = newCompany?.id ?? null;
      }
    }
  }

  const updatePayload: JobApplicationUpdate = { company_id: companyId };
  if (body.position !== undefined) updatePayload.position = body.position.trim();
  if (body.status !== undefined) updatePayload.status = body.status;
  if ("job_url" in body) updatePayload.job_url = body.job_url || null;
  if ("salary_range" in body) updatePayload.salary_range = body.salary_range || null;
  if ("location" in body) updatePayload.location = body.location || null;
  if ("applied_at" in body) updatePayload.applied_at = body.applied_at || null;
  if ("deadline" in body) updatePayload.deadline = body.deadline || null;
  if ("notes" in body) updatePayload.notes = body.notes || null;

  const { data, error } = await supabase
    .from("job_applications")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*, companies(name)")
    .single();

  if (error) {
    return Response.json({ error: error.message } satisfies ApiError, { status: 500 });
  }

  const row = toApplicationRow(data as SupabaseApplicationRow);
  await logEvent("application_update", {
    application_id: row.id,
    status: row.status,
  }, user.id);

  return Response.json(
    { data: row } satisfies ApplicationResponse
  );
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]">
): Promise<Response> {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" } satisfies ApiError, { status: 401 });
  }

  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message } satisfies ApiError, { status: 500 });
  }

  await logEvent("application_delete", { application_id: id }, user.id);

  return new Response(null, { status: 204 });
}
