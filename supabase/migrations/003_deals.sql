CREATE TABLE deals (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID           NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id      UUID           REFERENCES leads(id) ON DELETE SET NULL,
  owner_id     UUID           NOT NULL REFERENCES auth.users(id),
  title        TEXT           NOT NULL,
  value        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stage        TEXT           NOT NULL DEFAULT 'new_lead'
                 CHECK (stage IN ('new_lead','contacted','proposal_sent','negotiation','closed_won','closed_lost')),
  due_date     DATE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view deals"
  ON deals FOR SELECT
  USING (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can create deals"
  ON deals FOR INSERT
  WITH CHECK (
    workspace_id = ANY(get_user_workspace_ids())
    AND owner_id = auth.uid()
  );

CREATE POLICY "members can update deals"
  ON deals FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "admins or owner can delete deals"
  ON deals FOR DELETE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = deals.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
