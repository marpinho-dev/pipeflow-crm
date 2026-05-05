-- Adiciona campos de pagamento na tabela leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS project_value    NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS installments_count INT;

-- Cria tabela de parcelas de pagamento
CREATE TABLE payment_installments (
  id                 UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id       UUID           NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id            UUID           NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  installment_number INT            NOT NULL,
  amount             NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_date           DATE           NOT NULL,
  status             TEXT           NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid')),
  paid_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view payment_installments"
  ON payment_installments FOR SELECT
  USING (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can create payment_installments"
  ON payment_installments FOR INSERT
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can update payment_installments"
  ON payment_installments FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "admins can delete payment_installments"
  ON payment_installments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = payment_installments.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE TRIGGER payment_installments_updated_at
  BEFORE UPDATE ON payment_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
