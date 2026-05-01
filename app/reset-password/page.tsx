"use client";

import { useActionState, useState } from "react";
import { Lock } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import { PasswordStrength } from "@/components/auth/password-strength";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="w-10 h-10 rounded-xl bg-[#3182F6]/10 flex items-center justify-center mb-3">
            <Lock size={18} className="text-[#3182F6]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            새 비밀번호 설정
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            새로 사용하실 비밀번호를 입력해주세요.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              새 비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8~16자, 대소문자 + 숫자 + 특수문자"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
            <div className="pt-1">
              <PasswordStrength value={password} />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#3182F6] hover:bg-[#1a6fe8] active:bg-[#1560d4] disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {pending ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </div>
  );
}
