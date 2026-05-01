-- 005_essays.sql
-- 자소서 관리 (회사 폴더 + 문항 페이지 중첩 구조)
-- Supabase SQL Editor에서 한 번 실행. 멱등.

-- ──────────────────────────────────────────────
-- essays: 회사 단위 자소서 폴더
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS essays (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  job_title     TEXT NOT NULL,
  jd_url        TEXT,
  applied_date  DATE,
  deadline      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can manage own essays" ON essays;
CREATE POLICY "users can manage own essays"
  ON essays FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_essays_user_id  ON essays(user_id);
CREATE INDEX IF NOT EXISTS idx_essays_deadline ON essays(deadline);

-- updated_at 자동 갱신
DROP TRIGGER IF EXISTS essays_updated_at ON essays;
CREATE TRIGGER essays_updated_at
  BEFORE UPDATE ON essays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- essay_questions: 자소서 안의 문항 페이지
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS essay_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id      UUID NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  "order"       INTEGER NOT NULL DEFAULT 0,
  content       TEXT NOT NULL DEFAULT '',
  char_limit    INTEGER NOT NULL DEFAULT 500,
  count_mode    TEXT NOT NULL DEFAULT 'with_spaces'
                  CHECK (count_mode IN ('with_spaces','without_spaces')),
  answer        TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE essay_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can manage own essay questions" ON essay_questions;
CREATE POLICY "users can manage own essay questions"
  ON essay_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM essays
      WHERE id = essay_questions.essay_id
        AND user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_essay_questions_essay_id ON essay_questions(essay_id);
CREATE INDEX IF NOT EXISTS idx_essay_questions_order    ON essay_questions(essay_id, "order");

DROP TRIGGER IF EXISTS essay_questions_updated_at ON essay_questions;
CREATE TRIGGER essay_questions_updated_at
  BEFORE UPDATE ON essay_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
