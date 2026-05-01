/**
 * 비밀번호 정책: 8~16자 + 영문 대소문자 + 숫자 + 특수문자 모두 포함
 */
export const PASSWORD_RULES = [
  { id: "length", label: "8~16자", test: (p: string) => p.length >= 8 && p.length <= 16 },
  { id: "lower", label: "영문 소문자", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "영문 대문자", test: (p: string) => /[A-Z]/.test(p) },
  { id: "digit", label: "숫자", test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "특수문자", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

/**
 * 비밀번호 검증. 통과면 null, 실패면 한국어 에러 메시지.
 */
export function validatePassword(password: string): string | null {
  if (!password) return "비밀번호를 입력해주세요.";
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return `비밀번호는 ${PASSWORD_RULES.map((r) => r.label).join(" · ")}를 모두 포함해야 해요.`;
    }
  }
  return null;
}
