-- Adiciona coluna join_code na tabela workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- Gera códigos para workspaces existentes
UPDATE workspaces
SET join_code = upper(substring(md5(random()::text || id::text), 1, 8))
WHERE join_code IS NULL;

ALTER TABLE workspaces ALTER COLUMN join_code SET NOT NULL;

-- Trigger para gerar código automaticamente em novos workspaces
CREATE OR REPLACE FUNCTION generate_workspace_join_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    LOOP
      NEW.join_code := upper(substring(md5(random()::text), 1, 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM workspaces WHERE join_code = NEW.join_code);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_auto_join_code
  BEFORE INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION generate_workspace_join_code();

-- RPC: entrar no workspace pelo código (bypassa RLS — usuário ainda não é membro)
CREATE OR REPLACE FUNCTION join_workspace_by_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_existing      UUID;
BEGIN
  SELECT id INTO v_workspace_id
  FROM workspaces
  WHERE join_code = upper(trim(p_code));

  IF v_workspace_id IS NULL THEN
    RETURN json_build_object('error', 'Código inválido. Verifique com o administrador do workspace.');
  END IF;

  SELECT id INTO v_existing
  FROM workspace_members
  WHERE workspace_id = v_workspace_id AND user_id = auth.uid();

  IF v_existing IS NOT NULL THEN
    RETURN json_build_object('workspace_id', v_workspace_id, 'already_member', true);
  END IF;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, auth.uid(), 'member');

  RETURN json_build_object('workspace_id', v_workspace_id);
END;
$$;

-- RPC: regenerar código (somente admin)
CREATE OR REPLACE FUNCTION regenerate_workspace_join_code(p_workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role     TEXT;
  v_new_code TEXT;
BEGIN
  SELECT role INTO v_role
  FROM workspace_members
  WHERE workspace_id = p_workspace_id AND user_id = auth.uid();

  IF v_role IS DISTINCT FROM 'admin' THEN
    RETURN json_build_object('error', 'Apenas administradores podem regenerar o código.');
  END IF;

  LOOP
    v_new_code := upper(substring(md5(random()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM workspaces WHERE join_code = v_new_code);
  END LOOP;

  UPDATE workspaces SET join_code = v_new_code WHERE id = p_workspace_id;

  RETURN json_build_object('join_code', v_new_code);
END;
$$;
