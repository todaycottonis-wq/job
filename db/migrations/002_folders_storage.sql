-- 002_folders_storage.sql
-- D2: 문서 폴더 기능 + Supabase Storage 버킷

-- ──────────────────────────────────────────────
-- folders: 문서 분류용 폴더
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  emoji       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can manage own folders" ON folders;
CREATE POLICY "users can manage own folders"
  ON folders FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);

-- ──────────────────────────────────────────────
-- documents: folder_id 컬럼 추가 (없으면)
-- ──────────────────────────────────────────────
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);

-- ──────────────────────────────────────────────
-- Supabase Storage: documents 버킷 (Private)
-- ──────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 본인 path/{user_id}/* 만 접근 가능
DROP POLICY IF EXISTS "users can upload own files"   ON storage.objects;
DROP POLICY IF EXISTS "users can read own files"     ON storage.objects;
DROP POLICY IF EXISTS "users can delete own files"   ON storage.objects;

CREATE POLICY "users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
