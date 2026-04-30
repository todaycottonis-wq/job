import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/login"];
const ONBOARDING_PATH = "/onboarding";

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
    // API는 redirect 대신 라우트 핸들러가 401 응답하도록 통과
    if (isApi) return supabaseResponse;
    if (isPublic) return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2) 인증된 유저가 /login 이면 홈으로
  if (isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 3) 온보딩 게이트
  //    - /onboarding 자체와 /api는 통과
  //    - 그 외 페이지는 profiles.onboarded_at IS NULL 이면 /onboarding 강제
  if (!isOnboarding && !isApi) {
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
  }

  // 4) 이미 완료한 유저가 /onboarding 들어오면 홈으로
  if (isOnboarding) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.onboarded_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
