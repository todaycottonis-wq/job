"use client";

import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/password";

export function PasswordStrength({ value }: { value: string }) {
  if (!value) {
    return (
      <p className="text-[11px] text-zinc-400">
        8~16자 영문 대·소문자, 숫자, 특수문자 모두 포함
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-1 transition-colors ${
              ok
                ? "text-green-600 dark:text-green-400"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {ok ? (
              <Check size={11} strokeWidth={3} />
            ) : (
              <X size={11} strokeWidth={2} />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
