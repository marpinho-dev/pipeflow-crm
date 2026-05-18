-- Cria tabela de lojas parceiras
CREATE TABLE stores (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID           NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name                TEXT           NOT NULL,
  email               TEXT,
  phone               TEXT,
  referral_percentage NUMERIC(5, 2)  NOT NULL DEFAULT 0,
  sales_volume        NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view stores"
  ON stores FOR SELECT
  USING (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can create stores"
  ON stores FOR INSERT
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can update stores"
  ON stores FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "admins can delete stores"
  ON stores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = stores.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Compras registradas em cada loja (independente dos clientes/leads)
CREATE TABLE store_purchases (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID           NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  store_id      UUID           NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_name   TEXT           NOT NULL,
  amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  purchase_date DATE           NOT NULL,
  fee_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  fee_status    TEXT           NOT NULL DEFAULT 'pending' CHECK (fee_status IN ('pending', 'paid')),
  fee_paid_at   TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE store_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view store_purchases"
  ON store_purchases FOR SELECT
  USING (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can create store_purchases"
  ON store_purchases FOR INSERT
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "members can update store_purchases"
  ON store_purchases FOR UPDATE
  USING (workspace_id = ANY(get_user_workspace_ids()))
  WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "admins can delete store_purchases"
  ON store_purchases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = store_purchases.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE TRIGGER store_purchases_updated_at
  BEFORE UPDATE ON store_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
