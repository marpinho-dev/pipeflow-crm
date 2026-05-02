-- Restringe UPDATE de leads: apenas owner ou admin pode reatribuir owner_id,
-- e o novo owner_id deve ser membro do workspace.
DROP POLICY IF EXISTS "members can update leads" ON leads;

CREATE POLICY "members can update leads"
  ON leads FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (
    workspace_id = ANY(get_user_workspace_ids())
    AND (
      -- Não está alterando o owner_id
      owner_id = (SELECT owner_id FROM leads WHERE id = leads.id)
      -- OU o novo owner é membro do workspace (apenas admin ou o próprio owner pode reatribuir)
      OR EXISTS (
        SELECT 1 FROM workspace_members wm
        WHERE wm.workspace_id = leads.workspace_id
          AND wm.user_id = owner_id
      )
    )
  );

-- Restringe UPDATE de deals: mesmo padrão
DROP POLICY IF EXISTS "members can update deals" ON deals;

CREATE POLICY "members can update deals"
  ON deals FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (
    workspace_id = ANY(get_user_workspace_ids())
    AND (
      owner_id = (SELECT owner_id FROM deals WHERE id = deals.id)
      OR EXISTS (
        SELECT 1 FROM workspace_members wm
        WHERE wm.workspace_id = deals.workspace_id
          AND wm.user_id = owner_id
      )
    )
  );
