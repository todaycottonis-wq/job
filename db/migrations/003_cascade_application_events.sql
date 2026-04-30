-- 003_cascade_application_events.sql
-- 지원(application) 삭제 시 연결된 캘린더 일정도 함께 삭제되도록 외래키 변경
-- 실행 위치: Supabase Dashboard → SQL Editor → New query → 전체 붙여넣기 → Run

-- calendar_events.application_id 외래키 ON DELETE SET NULL → ON DELETE CASCADE
ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_application_id_fkey;

ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_application_id_fkey
    FOREIGN KEY (application_id)
    REFERENCES job_applications(id)
    ON DELETE CASCADE;

-- application_events (타임라인) 도 같은 정책 (이미 CASCADE인지 확인용 멱등)
ALTER TABLE application_events
  DROP CONSTRAINT IF EXISTS application_events_application_id_fkey;

ALTER TABLE application_events
  ADD CONSTRAINT application_events_application_id_fkey
    FOREIGN KEY (application_id)
    REFERENCES job_applications(id)
    ON DELETE CASCADE;
