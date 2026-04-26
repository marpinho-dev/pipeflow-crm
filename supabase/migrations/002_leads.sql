CREATE TABLE leads (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id     UUID        NOT NULL REFERENCES auth.users(id),
  name         TEXT        NOT NULL,
  email        TEXT,
  phone        TEXT,
  company      TEXT,
  role         TEXT,
  status       TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted', 'lost')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view leads"
  ON leads FOR SELECT
  USING (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can create leads"
  ON leads FOR INSERT
  WITH CHECK (
    workspace_id = ANY(get_user_workspace_ids())
    AND owner_id = auth.uid()
  );

CREATE POLICY "members can update leads"
  ON leads FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "admins or owner can delete leads"
  ON leads FOR DELETE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = leads.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
