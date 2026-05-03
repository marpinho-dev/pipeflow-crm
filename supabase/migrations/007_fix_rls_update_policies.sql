-- Corrige políticas de UPDATE para deals e leads.
-- O bug: subquery "SELECT owner_id FROM deals WHERE id = deals.id" era
-- auto-referencial (deals.id resolvia para a coluna da própria subquery),
-- retornando todos os registros e causando "more than one row returned by
-- a subquery used as an expression" quando há 2+ registros.
-- Solução: substituir pela verificação direta de que owner_id é membro do workspace.

DROP POLICY IF EXISTS "members can update deals" ON deals;

CREATE POLICY "members can update deals"
  ON deals FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (
    workspace_id = ANY(get_user_workspace_ids())
    AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_id
        AND wm.user_id = owner_id
    )
  );

DROP POLICY IF EXISTS "members can update leads" ON leads;

CREATE POLICY "members can update leads"
  ON leads FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (
    workspace_id = ANY(get_user_workspace_ids())
    AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_id
        AND wm.user_id = owner_id
    )
  );
