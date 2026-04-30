"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft size={12} />
          로그인으로 돌아가기
        </Link>

        <div>
          <div className="w-10 h-10 rounded-xl bg-[#3182F6]/10 flex items-center justify-center mb-3">
            <Mail size={18} className="text-[#3182F6]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            비밀번호 찾기
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            가입하신 이메일을 입력하시면 재설정 링크를 보내드려요.
          </p>
        </div>

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
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state?.info && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 px-3 py-2 text-sm text-green-700 dark:text-green-300">
              {state.info}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] active:bg-[#1560d4] disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {pending ? "전송 중..." : "재설정 링크 보내기"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          메일이 안 오면 스팸함을 확인하거나 1분 후 다시 시도해주세요.
        </p>
      </div>
    </div>
  );
}
