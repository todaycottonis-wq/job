import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * 랜딩 페이지(다른 도메인)에서 익명으로 호출하는 트래킹 엔드포인트.
 *
 * RLS 정책상 익명 INSERT가 막혀 있으므로 service_role 키로 처리.
 * 허용 이벤트만 받아서 다른 임의 이벤트가 섞이는 걸 막음.
 */

const ALLOWED_EVENTS = new Set([
  "landing_view",
  "landing_cta_click",
]);

// 정확한 origin 매칭 + *.vercel.app preview 도 허용
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (origin === "https://jobtrack-landing.vercel.app") return true;
  if (/^https:\/\/jobtrack-landing[a-z0-9-]*\.vercel\.app$/.test(origin)) return true;
  if (origin === "http://localhost:3000") return true;
  if (origin === "http://localhost:5500") return true;
  return false;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = isAllowedOrigin(origin) ? origin! : "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

interface TrackBody {
  event?: string;
  props?: Record<string, unknown>;
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const headers = corsHeaders(request.headers.get("origin"));
  // origin 미허용 시도 막기
  if (!headers["Access-Control-Allow-Origin"]) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers });
}

export async function POST(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!headers["Access-Control-Allow-Origin"]) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400, headers }
    );
  }

  if (!body.event || !ALLOWED_EVENTS.has(body.event)) {
    return Response.json(
      { error: "Invalid event" },
      { status: 400, headers }
    );
  }

  // props는 최대 8개 키 / 각 값 길이 200자로 제한 — 악의적 페이로드 방지
  const safeProps: Record<string, unknown> = {};
  if (body.props && typeof body.props === "object") {
    let count = 0;
    for (const [k, v] of Object.entries(body.props)) {
      if (count >= 8) break;
      if (typeof k !== "string" || k.length > 40) continue;
      if (typeof v === "string") {
        safeProps[k] = v.slice(0, 200);
      } else if (typeof v === "number" || typeof v === "boolean" || v === null) {
        safeProps[k] = v;
      }
      count++;
    }
  }

  // referrer / UA 같은 기본 메타도 함께 적재
  safeProps.referrer ??= request.headers.get("referer")?.slice(0, 200) ?? null;
  safeProps.ua ??= request.headers.get("user-agent")?.slice(0, 200) ?? null;

  const admin = createAdminClient();
  const { error } = await admin.from("usage_logs").insert({
    user_id: null,
    event: body.event,
    props: safeProps as never,
  });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers }
    );
  }

  return new Response(null, { status: 204, headers });
}
