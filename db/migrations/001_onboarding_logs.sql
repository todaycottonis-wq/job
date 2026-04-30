-- 001_onboarding_logs.sql
-- 신규 유저 온보딩 상태 + 사용자 행동 로그
--
-- 실행 위치: Supabase Dashboard → SQL Editor → New query → 전체 붙여넣기 → Run
-- 멱등하게 작성됨 (재실행해도 안전).

-- ──────────────────────────────────────────────
-- profiles: 유저별 온보딩 상태
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarded_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can manage own profile" ON profiles;
CREATE POLICY "users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- auth.users 생성 시 profiles 자동 row insert
-- (Server Action에서 별도로 insert 하지 않아도 됨)
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 기존 유저 백필 (이미 가입한 계정도 profiles row 보장)
INSERT INTO profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ──────────────────────────────────────────────
-- usage_logs: 행동 이벤트 적재
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event       TEXT NOT NULL,
  props       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can insert own logs" ON usage_logs;
CREATE POLICY "users can insert own logs"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can read own logs" ON usage_logs;
CREATE POLICY "users can read own logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id    ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_event      ON usage_logs(event);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
