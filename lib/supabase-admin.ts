import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * RLS를 우회하는 service_role 클라이언트.
 * 절대로 클라이언트 컴포넌트나 일반 사용자 흐름에서 호출 금지.
 * requireAdmin() 통과 이후에만 사용.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
