import type { ApplicationStatus } from "./database";

// ── Re-export for convenience ──────────────────────────────────────────────
export type { ApplicationStatus };

// ── UI row (flattened join of job_applications + companies) ────────────────
export interface ApplicationRow {
  id: string;
  company_name: string;         // from companies.name
  company_id: string | null;
  position: string;
  status: ApplicationStatus;
  job_url: string | null;
  salary_range: string | null;
  location: string | null;
  applied_at: string | null;    // ISO date string YYYY-MM-DD
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Form data (what the user fills in) ────────────────────────────────────
export interface ApplicationFormData {
  company_name: string;
  position: string;
  status: ApplicationStatus;
  job_url: string;
  salary_range: string;
  location: string;
  applied_at: string;           // YYYY-MM-DD or ""
  deadline: string;             // YYYY-MM-DD or ""
  notes: string;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist:   "위시리스트",
  applied:    "지원완료",
  screening:  "서류심사",
  interview:  "면접",
  offer:      "최종합격",
  rejected:   "불합격",
  withdrawn:  "취소",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  wishlist:   "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  applied:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  screening:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  interview:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  offer:      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  withdrawn:  "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

// ── API request / response shapes ─────────────────────────────────────────
export interface CreateApplicationRequest {
  company_name: string;
  position: string;
  status?: ApplicationStatus;
  job_url?: string | null;
  salary_range?: string | null;
  location?: string | null;
  applied_at?: string | null;
  deadline?: string | null;
  notes?: string | null;
}

export interface UpdateApplicationRequest {
  company_name?: string;
  position?: string;
  status?: ApplicationStatus;
  job_url?: string | null;
  salary_range?: string | null;
  location?: string | null;
  applied_at?: string | null;
  deadline?: string | null;
  notes?: string | null;
}

export interface ApplicationsResponse {
  data: ApplicationRow[];
  count: number;
}

export interface ApplicationResponse {
  data: ApplicationRow;
}

export interface ApiError {
  error: string;
}

// ── UI state ───────────────────────────────────────────────────────────────
export type ApplicationFormMode = "create" | "edit";

export interface ApplicationFilter {
  status: ApplicationStatus | "all";
  search: string;
}
