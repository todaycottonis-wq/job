import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/forgot-password", "/reset-password"];
const ONBOARDING_PATH = "/onboarding";
const ONB_COOKIE = "jt_onb"; // value = user_id of last onboarded user

function pathStartsWith(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isOnboarding = pathStartsWith(pathname, ONBOARDING_PATH);
  const isApi = pathname.startsWith("/api");
  const isPublic = PUBLIC_PREFIXES.some((p) => pathStartsWith(pathname, p));

  // 1) 미인증
  if (!user) {
    if (isApi) return supabaseResponse;
    if (isPublic) return supabaseResponse;
    // 랜딩 페이지(/)는 비로그인 허용
    if (pathname === "/") return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    // 다른 유저로 바뀌었을 수 있으니 캐시 정리
    res.cookies.delete(ONB_COOKIE);
    return res;
  }

  // 2) 인증된 유저가 /login 이면 홈으로
  if (isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ── 온보딩 캐시 (성능) ─────────────────────────────────────
  // 쿠키에 자기 user_id가 들어있으면 onboarded 완료로 간주 → DB 조회 생략
  const onbCookie = request.cookies.get(ONB_COOKIE)?.value;
  const onboardedFromCookie = onbCookie === user.id;

  // 3) 온보딩 게이트
  if (!isOnboarding && !isApi && !onboardedFromCookie) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.onboarded_at) {
      const url = request.nextUrl.clone();
      url.pathname = ONBOARDING_PATH;
      return NextResponse.redirect(url);
    }

    // 완료 상태면 쿠키 발급해서 다음부터 DB 조회 생략
    supabaseResponse.cookies.set(ONB_COOKIE, user.id, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  // 4) 이미 완료한 유저가 /onboarding 들어오면 홈으로
  if (isOnboarding) {
    if (onboardedFromCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.onboarded_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      const res = NextResponse.redirect(url);
      res.cookies.set(ONB_COOKIE, user.id, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return res;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
