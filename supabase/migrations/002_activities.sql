-- M12: adiciona colunas de conclusão na tabela activities (já existente)

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS completed    BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
