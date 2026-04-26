-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE workspaces (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT        NOT NULL,
  slug                   TEXT        NOT NULL UNIQUE,
  plan                   TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

CREATE TABLE invites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token        TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at  TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles synced from auth.users via trigger
CREATE TABLE profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  name       TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Helper function (must exist before policies that reference it) ────────────

-- Returns array of workspace IDs where the current user is a member.
-- SECURITY DEFINER bypasses RLS inside the function, preventing infinite recursion
-- when this function is used inside workspace_members policies.
CREATE OR REPLACE FUNCTION get_user_workspace_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT workspace_id
    FROM workspace_members
    WHERE user_id = auth.uid()
  );
$$;

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;

-- workspaces
CREATE POLICY "members can view their workspace"
  ON workspaces FOR SELECT
  USING (id = ANY(get_user_workspace_ids()));

CREATE POLICY "authenticated users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admins can update workspace"
  ON workspaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role = 'admin'
    )
  );

-- workspace_members
CREATE POLICY "members can view workspace members"
  ON workspace_members FOR SELECT
  USING (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "admins can update member roles"
  ON workspace_members FOR UPDATE
  USING (
    workspace_id = ANY(get_user_workspace_ids())
    AND EXISTS (
      SELECT 1 FROM workspace_members m2
      WHERE m2.workspace_id = workspace_members.workspace_id
        AND m2.user_id = auth.uid()
        AND m2.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members m2
      WHERE m2.workspace_id = workspace_members.workspace_id
        AND m2.user_id = auth.uid()
        AND m2.role = 'admin'
    )
  );

CREATE POLICY "admins can remove members or members can leave"
  ON workspace_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members m2
      WHERE m2.workspace_id = workspace_members.workspace_id
        AND m2.user_id = auth.uid()
        AND m2.role = 'admin'
    )
  );

-- invites
CREATE POLICY "admins can manage invites"
  ON invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = invites.workspace_id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = invites.workspace_id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role = 'admin'
    )
  );

-- profiles
CREATE POLICY "users can view profiles in their workspaces"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT user_id FROM workspace_members
      WHERE workspace_id = ANY(get_user_workspace_ids())
    )
  );

CREATE POLICY "users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── Functions ────────────────────────────────────────────────────────────────

-- Atomically creates a workspace and adds the creator as admin
CREATE OR REPLACE FUNCTION create_workspace(p_name TEXT, p_slug TEXT)
RETURNS workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace workspaces;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to create a workspace';
  END IF;

  INSERT INTO workspaces (name, slug)
  VALUES (p_name, p_slug)
  RETURNING * INTO v_workspace;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace.id, auth.uid(), 'admin');

  RETURN v_workspace;
END;
$$;

-- Returns invite details by token (no RLS — used on public invite page)
CREATE OR REPLACE FUNCTION get_invite_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite    invites%ROWTYPE;
  v_workspace workspaces%ROWTYPE;
BEGIN
  SELECT * INTO v_invite
  FROM invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Convite não encontrado ou expirado');
  END IF;

  SELECT * INTO v_workspace FROM workspaces WHERE id = v_invite.workspace_id;

  RETURN jsonb_build_object(
    'id',             v_invite.id,
    'email',          v_invite.email,
    'role',           v_invite.role,
    'workspace_id',   v_invite.workspace_id,
    'workspace_name', v_workspace.name,
    'workspace_plan', v_workspace.plan
  );
END;
$$;

-- Validates token, inserts workspace_member, marks invite accepted
CREATE OR REPLACE FUNCTION accept_workspace_invite(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite     invites%ROWTYPE;
  v_user_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('error', 'Você precisa estar logado para aceitar o convite');
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();

  SELECT * INTO v_invite
  FROM invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Convite não encontrado ou expirado');
  END IF;

  IF v_invite.email != v_user_email THEN
    RETURN jsonb_build_object('error', 'Este convite foi enviado para outro e-mail');
  END IF;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_invite.workspace_id, auth.uid(), v_invite.role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  UPDATE invites SET accepted_at = NOW() WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'workspace_id', v_invite.workspace_id,
    'role',         v_invite.role
  );
END;
$$;

-- ─── Trigger: sync profiles on signup ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
