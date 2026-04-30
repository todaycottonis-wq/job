/**
 * Supabase Auth 에러 메시지를 한국어로 매핑.
 * Supabase가 반환하는 영어 메시지를 substring 매칭.
 */
export function koreanizeAuthError(msg: string | undefined | null): string {
  if (!msg) return "오류가 발생했어요. 잠시 후 다시 시도해주세요.";
  const m = msg.toLowerCase();

  if (m.includes("already registered") || m.includes("user already"))
    return "이미 가입된 이메일이에요. 로그인하거나 비밀번호 찾기를 이용해주세요.";
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (m.includes("email not confirmed"))
    return "이메일 인증이 필요해요. 가입 시 받은 메일에서 인증 링크를 눌러주세요.";
  if (m.includes("invalid email"))
    return "이메일 형식이 올바르지 않아요.";
  if (m.includes("at least 6") || m.includes("password should"))
    return "비밀번호는 6자 이상이어야 해요.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "너무 많은 시도가 있었어요. 1분 정도 후 다시 시도해주세요.";
  if (m.includes("user not found"))
    return "해당 이메일로 가입된 계정을 찾을 수 없어요.";
  if (m.includes("expired") || m.includes("invalid token"))
    return "링크가 만료되었어요. 다시 요청해주세요.";

  return msg;
}
