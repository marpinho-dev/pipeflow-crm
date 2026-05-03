-- Remove a constraint antiga primeiro
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_stage_check;

-- Migra deals existentes para os novos stages
UPDATE deals SET stage = 'novo_cliente'        WHERE stage = 'new_lead';
UPDATE deals SET stage = 'apresentar_proposta' WHERE stage = 'contacted';
UPDATE deals SET stage = 'proposta_aceita'     WHERE stage = 'proposal_sent';
UPDATE deals SET stage = 'obra_andamento'      WHERE stage = 'negotiation';
UPDATE deals SET stage = 'obra_finalizada'     WHERE stage = 'closed_won';
UPDATE deals SET stage = 'cliente_perdido'     WHERE stage = 'closed_lost';

-- Adiciona nova constraint com os stages atualizados
ALTER TABLE deals
  ADD CONSTRAINT deals_stage_check
  CHECK (stage IN (
    'novo_cliente',
    'apresentar_proposta',
    'proposta_aceita',
    'obra_andamento',
    'obra_finalizada',
    'cliente_perdido',
    'cliente_stand_by'
  ));

-- Atualiza o valor default
ALTER TABLE deals ALTER COLUMN stage SET DEFAULT 'novo_cliente';
