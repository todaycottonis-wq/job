"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Info, Mail } from "lucide-react";
import { login, signup } from "@/app/actions/auth";
import { PasswordStrength } from "@/components/auth/password-strength";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const params = useSearchParams();
  const resetOk = params.get("reset") === "ok";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    undefined
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    undefined
  );

  const isLogin = mode === "login";

  // 회원가입 성공 → 메일 확인 안내 화면으로 전환
  if (!isLogin && signupState?.info) {
    return <CheckEmailScreen email={email} />;
  }

  const state = isLogin ? loginState : signupState;
  const action = isLogin ? loginAction : signupAction;
  const pending = isLogin ? loginPending : signupPending;
  const isDuplicateError =
    !isLogin && !!state?.error && state.error.includes("이미 가입");

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {isLogin ? "로그인" : "회원가입"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isLogin
              ? "커리업에 다시 오신 걸 환영해요"
              : "취준의 첫 페이지를 함께 열어볼까요"}
          </p>
        </div>

        {resetOk && isLogin && (
          <div
            role="status"
            className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 px-3 py-2 text-sm text-green-700 dark:text-green-300"
          >
            비밀번호가 변경됐어요. 새 비밀번호로 로그인해주세요.
          </div>
        )}

        {!isLogin && (
          <div className="rounded-lg bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 px-3.5 py-3 text-xs text-blue-800 dark:text-blue-300 flex gap-2.5">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="leading-relaxed">
              <p className="font-semibold">이메일 인증으로 가입이 완료돼요</p>
              <p className="mt-0.5 text-blue-700/90 dark:text-blue-300/90">
                ① 이메일·비밀번호 입력 → ② 받은 메일의 링크 클릭 → ③ 가입 완료
              </p>
            </div>
          </div>
        )}

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                비밀번호
              </label>
              {isLogin && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-500 hover:text-[#3182F6] hover:underline"
                >
                  비밀번호 찾기
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                placeholder={
                  isLogin ? "••••••••" : "8~16자, 대소문자 + 숫자 + 특수문자"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                aria-pressed={showPassword}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && (
              <div className="pt-1">
                <PasswordStrength value={password} />
              </div>
            )}
          </div>

          {/* honeypot: 사람은 보이지 않음 — bot 가입 차단용 */}
          {!isLogin && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              <label htmlFor="company_phone">회사 전화 (입력하지 마세요)</label>
              <input
                id="company_phone"
                name="company_phone"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          )}

          {state?.error && (
            <div role="alert" className="space-y-1.5">
              <p className="text-sm text-red-600 dark:text-red-400">
                {state.error}
              </p>
              {isDuplicateError && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-[#3182F6] hover:underline"
                >
                  로그인 화면으로 가기
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] active:bg-[#1560d4] disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {pending
              ? isLogin
                ? "로그인 중..."
                : "계정 생성 중..."
              : isLogin
              ? "로그인"
              : "계정 만들기"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          {isLogin ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
          <button
            onClick={() => setMode(isLogin ? "signup" : "login")}
            className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
          >
            {isLogin ? "회원가입" : "로그인"}
          </button>
        </p>
      </div>
    </div>
  );
}

function CheckEmailScreen({ email }: { email: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div
        role="status"
        className="w-full max-w-sm space-y-5 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800"
      >
        <div>
          <div className="w-12 h-12 rounded-2xl bg-[#3182F6]/10 flex items-center justify-center mb-4">
            <Mail size={22} className="text-[#3182F6]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            메일함을 확인해주세요
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {email ? (
              <>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {email}
                </span>
                {" "}으로 인증 메일을 보냈어요. 메일의 링크를 눌러야 가입이
                완료돼요.
              </>
            ) : (
              "방금 입력하신 이메일로 인증 메일을 보냈어요. 메일의 링크를 눌러야 가입이 완료돼요."
            )}
          </p>
        </div>

        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 px-4 py-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            <span aria-hidden="true">⏱️ </span>
            보통 1~2분 안에 도착해요. 안 보이면{" "}
            <strong className="text-zinc-900 dark:text-zinc-50">
              스팸함
            </strong>
            도 확인해보세요.
          </p>
          <p>
            <span aria-hidden="true">✏️ </span>
            이메일을 잘못 입력하셨다면{" "}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-medium text-[#3182F6] hover:underline"
            >
              다시 시도
            </button>
            해주세요.
          </p>
        </div>

        <Link
          href="/login"
          className="block w-full text-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50 transition-colors"
        >
          인증 후 로그인하러 가기
        </Link>
      </div>
    </div>
  );
}
