-- 004_v2_features.sql
-- 2차~6차 변경 한 번에:
--   1) 진행 상태 7단계로 변경
--   2) 폴더 색깔 (folders.color)
--   3) 사용자 정의 일정 유형 (user_event_types + calendar_events.user_event_type_id)
--   4) 지원-문서 N:M (application_documents)
--
-- 멱등하게 작성. Supabase SQL Editor에서 한 번 실행.

-- ──────────────────────────────────────────────
-- 1. 진행 상태 7단계
--    기존: wishlist/applied/screening/interview/offer/rejected/withdrawn
--    신규: drafting/applied/aptitude/interview_1/interview_2/offer/rejected
-- ──────────────────────────────────────────────

ALTER TABLE job_applications
  DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- 기존 데이터 매핑
UPDATE job_applications SET status = 'drafting'      WHERE status = 'wishlist';
UPDATE job_applications SET status = 'aptitude'      WHERE status = 'screening';
UPDATE job_applications SET status = 'interview_1'   WHERE status = 'interview';
UPDATE job_applications SET status = 'rejected'      WHERE status = 'withdrawn';

ALTER TABLE job_applications
  ADD CONSTRAINT job_applications_status_check
  CHECK (status IN (
    'drafting',
    'applied',
    'aptitude',
    'interview_1',
    'interview_2',
    'offer',
    'rejected'
  ));

-- default도 변경
ALTER TABLE job_applications
  ALTER COLUMN status SET DEFAULT 'drafting';

-- ──────────────────────────────────────────────
-- 2. 폴더 색깔 컬럼
-- ──────────────────────────────────────────────

ALTER TABLE folders
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT 'blush';

-- ──────────────────────────────────────────────
-- 3. 사용자 정의 일정 유형
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_event_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT 'purple',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

ALTER TABLE user_event_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users can manage own event types" ON user_event_types;
CREATE POLICY "users can manage own event types"
  ON user_event_types FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_event_types_user ON user_event_types(user_id);

-- calendar_events 에 user_event_type_id 추가 (기본 event_type 도 유지)
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS user_event_type_id UUID
    REFERENCES user_event_types(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_event_type
  ON calendar_events(user_event_type_id);

-- ──────────────────────────────────────────────
-- 4. 지원-문서 다중 연결 (N:M)
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_documents (
  application_id  UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (application_id, document_id)
);

ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users can manage own application_documents" ON application_documents;
CREATE POLICY "users can manage own application_documents"
  ON application_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE id = application_documents.application_id
        AND user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_application_documents_app ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_doc ON application_documents(document_id);
