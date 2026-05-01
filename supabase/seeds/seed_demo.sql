-- Seed de demonstração: 10 leads, deals em etapas variadas, 5 atividades
-- Roda no SQL Editor do Supabase (bypassa RLS automaticamente)

DO $$
DECLARE
  v_workspace_id UUID;
  v_user_id      UUID;
  l1 UUID; l2 UUID; l3 UUID; l4 UUID; l5 UUID;
  l6 UUID; l7 UUID; l8 UUID; l9 UUID; l10 UUID;
BEGIN
  -- Pega o primeiro workspace e o admin dele
  SELECT wm.workspace_id, wm.user_id
    INTO v_workspace_id, v_user_id
    FROM workspace_members wm
    WHERE wm.role = 'admin'
    LIMIT 1;

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum workspace encontrado. Crie um workspace primeiro.';
  END IF;

  -- ── 10 LEADS ────────────────────────────────────────────────────────────────

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Ana Beatriz Lima',      'ana.lima@techcorp.com.br',    '(11) 99201-4832', 'TechCorp',       'Diretora de TI',         'active')
  RETURNING id INTO l1;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Carlos Mendes',         'carlos@inovafin.com.br',      '(21) 98734-0021', 'InovaFin',       'CEO',                    'active')
  RETURNING id INTO l2;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Fernanda Rocha',        'f.rocha@logismais.com.br',    '(31) 97845-3310', 'LogisMais',      'Gerente de Operações',   'active')
  RETURNING id INTO l3;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Ricardo Andrade',       'r.andrade@construmax.com.br', '(41) 99312-7754', 'ConstruMax',     'Diretor Financeiro',     'active')
  RETURNING id INTO l4;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Juliana Pires',         'ju.pires@saludemed.com.br',   '(51) 98001-6623', 'SaludeMed',      'Coordenadora de Compras','active')
  RETURNING id INTO l5;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Marcos Vinicius Costa', 'marcos@eduplanet.com.br',     '(85) 99450-1187', 'EduPlanet',      'CTO',                    'active')
  RETURNING id INTO l6;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Patrícia Souza',        'p.souza@varejo360.com.br',    '(62) 98223-9940', 'Varejo360',      'Head de Marketing',      'converted')
  RETURNING id INTO l7;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Bruno Carvalho',        'bruno@agropecplus.com.br',    '(67) 99100-3356', 'AgroPlus',       'Sócio-Fundador',         'active')
  RETURNING id INTO l8;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Larissa Monteiro',      'larissa@nexosoft.com.br',     '(71) 98756-2209', 'NexoSoft',       'Product Manager',        'inactive')
  RETURNING id INTO l9;

  INSERT INTO leads (id, workspace_id, owner_id, name, email, phone, company, role, status)
  VALUES
    (gen_random_uuid(), v_workspace_id, v_user_id, 'Diego Fonseca',         'diego@mediawave.com.br',      '(81) 99632-8841', 'MediaWave',      'Diretor Comercial',      'lost')
  RETURNING id INTO l10;

  -- ── DEALS (etapas variadas) ──────────────────────────────────────────────────

  INSERT INTO deals (workspace_id, lead_id, owner_id, title, value, stage, due_date) VALUES
    (v_workspace_id, l1,  v_user_id, 'Licença anual TechCorp',        48000.00, 'negotiation',    CURRENT_DATE + 7),
    (v_workspace_id, l2,  v_user_id, 'Implantação InovaFin',          32000.00, 'proposal_sent',  CURRENT_DATE + 14),
    (v_workspace_id, l3,  v_user_id, 'Módulo logística LogisMais',    18500.00, 'contacted',      CURRENT_DATE + 21),
    (v_workspace_id, l4,  v_user_id, 'Consultoria ConstruMax',        12000.00, 'new_lead',       CURRENT_DATE + 30),
    (v_workspace_id, l5,  v_user_id, 'Plataforma SaludeMed',          75000.00, 'negotiation',    CURRENT_DATE + 5),
    (v_workspace_id, l6,  v_user_id, 'EduPlanet — integração API',    22000.00, 'proposal_sent',  CURRENT_DATE + 10),
    (v_workspace_id, l7,  v_user_id, 'Varejo360 — plano Pro anual',    9600.00, 'closed_won',     CURRENT_DATE - 3),
    (v_workspace_id, l8,  v_user_id, 'AgroPlus — rastreamento',       41000.00, 'contacted',      CURRENT_DATE + 18),
    (v_workspace_id, l9,  v_user_id, 'NexoSoft — suporte enterprise',  6000.00, 'new_lead',       CURRENT_DATE + 45),
    (v_workspace_id, l10, v_user_id, 'MediaWave — campanha digital',  15000.00, 'closed_lost',    CURRENT_DATE - 10);

  -- ── 5 ATIVIDADES ────────────────────────────────────────────────────────────

  INSERT INTO activities (workspace_id, lead_id, author_id, type, description, activity_date) VALUES
    (v_workspace_id, l1, v_user_id, 'call',
      'Ligação de follow-up com Ana. Ela pediu proposta revisada com desconto para contrato de 2 anos. Retornar até sexta.',
      NOW() - INTERVAL '2 days'),

    (v_workspace_id, l2, v_user_id, 'meeting',
      'Reunião de apresentação com Carlos e equipe técnica da InovaFin. Demo do painel de relatórios foi bem recebida. Próximo passo: enviar proposta formal.',
      NOW() - INTERVAL '5 days'),

    (v_workspace_id, l5, v_user_id, 'email',
      'Enviado e-mail com proposta atualizada e cronograma de implantação para Juliana. Aguardando aprovação do jurídico deles.',
      NOW() - INTERVAL '1 day'),

    (v_workspace_id, l7, v_user_id, 'note',
      'Contrato assinado! Patrícia confirmou pagamento via boleto. Onboarding agendado para a próxima segunda-feira.',
      NOW() - INTERVAL '3 days'),

    (v_workspace_id, l3, v_user_id, 'call',
      'Primeiro contato com Fernanda. Empresa avaliando 3 fornecedores. Nosso diferencial é a integração com o ERP deles. Agendar demo técnica.',
      NOW() - INTERVAL '7 days');

  RAISE NOTICE 'Seed concluído! workspace_id: %, user_id: %', v_workspace_id, v_user_id;
END $$;
