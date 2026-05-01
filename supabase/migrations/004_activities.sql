CREATE TABLE activities (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id       UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES auth.users(id),
  type          TEXT        NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  description   TEXT        NOT NULL,
  activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view activities"
  ON activities FOR SELECT
  USING (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    workspace_id = ANY(get_user_workspace_ids())
    AND author_id = auth.uid()
  );

CREATE POLICY "author or admin can update activities"
  ON activities FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = activities.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "author or admin can delete activities"
  ON activities FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = activities.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
