import { createClient } from "@/lib/supabase-server";
import { logEvent } from "@/lib/logger";
import {
  APPLICATION_STATUS_LABELS,
} from "@/types/application";
import type { ApplicationStatus } from "@/types/database";

interface Row {
  status: ApplicationStatus;
  position: string;
  applied_at: string | null;
  deadline: string | null;
  location: string | null;
  job_url: string | null;
  notes: string | null;
  created_at: string;
  companies: { name: string } | null;
}

function csvField(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("job_applications")
    .select(
      "status, position, applied_at, deadline, location, job_url, notes, created_at, companies(name)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return new Response(error.message, { status: 500 });

  const rows = (data as unknown as Row[]) ?? [];

  const headers = [
    "회사",
    "직무",
    "상태",
    "지원일",
    "마감일",
    "근무지",
    "공고URL",
    "메모",
    "추가일시",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvField(r.companies?.name ?? ""),
        csvField(r.position),
        csvField(APPLICATION_STATUS_LABELS[r.status]),
        csvField(r.applied_at ?? ""),
        csvField(r.deadline ?? ""),
        csvField(r.location ?? ""),
        csvField(r.job_url ?? ""),
        csvField(r.notes ?? ""),
        csvField(r.created_at),
      ].join(",")
    );
  }

  await logEvent("data_export", { count: rows.length }, user.id);

  // BOM \uFEFF로 엑셀 한글 깨짐 방지
  const csv = "\uFEFF" + lines.join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="careerup-applications-${date}.csv"`,
    },
  });
}
