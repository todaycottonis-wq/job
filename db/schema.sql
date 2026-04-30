-- JobTrack Database Schema
-- Supabase SQL Editor에서 실행하세요.

-- 기존 테이블 정리 (재실행 시)
DROP TABLE IF EXISTS ai_feedback CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS application_events CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- ──────────────────────────────────────────────
-- Companies
-- ──────────────────────────────────────────────
CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  website     TEXT,
  industry    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own companies"
  ON companies FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Job Applications
-- ──────────────────────────────────────────────
CREATE TABLE job_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  position      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'wishlist'
                  CHECK (status IN ('wishlist','applied','screening','interview','offer','rejected','withdrawn')),
  job_url       TEXT,
  salary_range  TEXT,
  location      TEXT,
  applied_at    DATE,
  deadline      DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own applications"
  ON job_applications FOR ALL USING (auth.uid() = user_id);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- Application Events (타임라인)
-- ──────────────────────────────────────────────
CREATE TABLE application_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL
                    CHECK (event_type IN ('applied','screening','interview','offer','rejected','note')),
  title           TEXT NOT NULL,
  description     TEXT,
  scheduled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own application events"
  ON application_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE id = application_events.application_id
        AND user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────
-- Documents (이력서, 자기소개서 등)
-- ──────────────────────────────────────────────
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES job_applications(id) ON DELETE SET NULL,
  type            TEXT NOT NULL
                    CHECK (type IN ('resume','cover_letter','portfolio','other')),
  title           TEXT NOT NULL,
  content         TEXT,
  file_url        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own documents"
  ON documents FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- AI Feedback
-- ──────────────────────────────────────────────
CREATE TABLE ai_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id     UUID REFERENCES documents(id) ON DELETE SET NULL,
  application_id  UUID REFERENCES job_applications(id) ON DELETE SET NULL,
  feedback_type   TEXT NOT NULL
                    CHECK (feedback_type IN ('resume_review','cover_letter_review','interview_prep','general')),
  prompt          TEXT,
  response        TEXT NOT NULL,
  model           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own ai feedback"
  ON ai_feedback FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Calendar Events
-- ──────────────────────────────────────────────
CREATE TABLE calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES job_applications(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT NOT NULL
                    CHECK (event_type IN ('interview','deadline','follow_up','other')),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  location        TEXT,
  meeting_url     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own calendar events"
  ON calendar_events FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────
CREATE INDEX idx_companies_user_id          ON companies(user_id);
CREATE INDEX idx_job_applications_user_id   ON job_applications(user_id);
CREATE INDEX idx_job_applications_status    ON job_applications(status);
CREATE INDEX idx_application_events_app_id  ON application_events(application_id);
CREATE INDEX idx_documents_user_id          ON documents(user_id);
CREATE INDEX idx_ai_feedback_user_id        ON ai_feedback(user_id);
CREATE INDEX idx_calendar_events_user_id    ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_starts_at  ON calendar_events(starts_at);
