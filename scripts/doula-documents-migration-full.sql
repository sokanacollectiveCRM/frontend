-- =============================================================================
-- Doula Documents: Full migration (run in Supabase SQL Editor)
-- Fixes: "Could not find the table 'public.doula_documents'"
-- =============================================================================

-- 1. Create table (doula_id without FK so it works even if public.users is missing)
CREATE TABLE IF NOT EXISTS doula_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doula_id UUID NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_path TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'uploaded',
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doula_documents_doula_id ON doula_documents(doula_id);
CREATE INDEX IF NOT EXISTS idx_doula_documents_type ON doula_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_doula_documents_status ON doula_documents(status);
CREATE INDEX IF NOT EXISTS idx_doula_documents_doula_type ON doula_documents(doula_id, document_type);

CREATE OR REPLACE FUNCTION update_doula_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_doula_documents_updated_at ON doula_documents;
CREATE TRIGGER trigger_doula_documents_updated_at
  BEFORE UPDATE ON doula_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_doula_documents_updated_at();

-- 2. RLS - allow authenticated users to manage their own docs (doula_id = auth.uid())
ALTER TABLE doula_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doulas can view their own documents" ON doula_documents;
DROP POLICY IF EXISTS "Doulas can insert their own documents" ON doula_documents;
DROP POLICY IF EXISTS "Doulas can update their own documents" ON doula_documents;
DROP POLICY IF EXISTS "Doulas can delete their own documents" ON doula_documents;

CREATE POLICY "Doulas can view their own documents"
  ON doula_documents FOR SELECT TO authenticated
  USING (doula_id = auth.uid());

CREATE POLICY "Doulas can insert their own documents"
  ON doula_documents FOR INSERT TO authenticated
  WITH CHECK (doula_id = auth.uid());

CREATE POLICY "Doulas can update their own documents"
  ON doula_documents FOR UPDATE TO authenticated
  USING (doula_id = auth.uid()) WITH CHECK (doula_id = auth.uid());

CREATE POLICY "Doulas can delete their own documents"
  ON doula_documents FOR DELETE TO authenticated
  USING (doula_id = auth.uid());

-- 3. Service role can bypass RLS (backend uses service role for admin ops)
