-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TENANTS ────────────────────────────────────────────────────────────────
CREATE TABLE tenants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── USERS ──────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ISSUES ─────────────────────────────────────────────────────────────────
CREATE TABLE issues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  location    TEXT,
  impact      INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
  likelihood  INT NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  risk_score  INT GENERATED ALWAYS AS (impact * likelihood) STORED,
  priority    TEXT NOT NULL DEFAULT 'medium',
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ACTIONS ────────────────────────────────────────────────────────────────
CREATE TABLE actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  issue_id    UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  assigned_to TEXT,
  due_date    DATE,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── COMMENTS ───────────────────────────────────────────────────────────────
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  issue_id   UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  comment    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ROW-LEVEL SECURITY ─────────────────────────────────────────────────────
ALTER TABLE issues   ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_issues
  ON issues USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_actions
  ON actions USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_comments
  ON comments USING (tenant_id::text = current_setting('app.current_tenant_id', true));