# CLAUDE.md — CivicPulse

This file guides AI assistants working on this codebase.
Read it fully before making any changes.

## Project Overview

CivicPulse is a multi-tenant SaaS application for small councils, contractors,
and operations teams to report and track infrastructure issues such as potholes,
blocked drains, damaged signs, and maintenance risks.

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React, TypeScript, Vite, Tailwind |
| Backend    | Node.js, Express, TypeScript, Zod |
| Database   | PostgreSQL with Row-Level Security |
| Testing    | Vitest, Supertest                 |
| DevOps     | Docker Compose, GitHub Actions    |

## Critical Rules

### 1. Every database query must use withTenant()

All queries that touch tenant data must go through the withTenant() helper
in apps/api/src/db/withTenant.ts. This sets app.current_tenant_id before
every query, which activates PostgreSQL Row-Level Security.

NEVER query tenant tables directly without withTenant(). This is the most
important rule in this codebase.

Good:
```typescript
const issues = await withTenant(tenantId, async (client) => {
  return (await client.query("SELECT * FROM issues WHERE tenant_id = $1", [tenantId])).rows;
});
```

Bad:
```typescript
const issues = await pool.query("SELECT * FROM issues");
```

### 2. Validate all input with Zod

Every POST and PUT endpoint must validate request bodies using Zod before
touching the database. See apps/api/src/routes/issues.ts for an example.

### 3. Never trust the client for tenant ID

The tenant ID always comes from the x-tenant-id request header, set by
the tenantMiddleware. Never accept tenant_id from the request body.

### 4. RLS policies exist on these tables

- issues
- actions
- comments

If you add a new tenant-scoped table, you must:
1. Add tenant_id UUID NOT NULL REFERENCES tenants(id)
2. ENABLE ROW LEVEL SECURITY on the table
3. CREATE POLICY for tenant isolation
4. Add a test in apps/api/src/tests/tenant-isolation.test.ts

### 5. Run tests before committing

```bash
cd apps/api
npm test
```

All 6 RLS leak tests must pass before any commit.

## Project Structure
civicpulse/
apps/
web/          # React frontend
api/          # Express backend
src/
db/       # pool.ts and withTenant.ts
middleware/  # tenant.ts
routes/   # issues.ts, dashboard.ts
tests/    # RLS leak tests
db/
migrations/   # SQL migration files
seed/         # Seed data
docs/           # Architecture and security notes
.github/
workflows/    # GitHub Actions CI

## Running Locally

Start the database:
```bash
docker compose up -d
```

Start the API:
```bash
cd apps/api
npm run dev
```

Start the frontend:
```bash
cd apps/web
npm run dev
```

## Environment Variables

apps/api/.env:
DATABASE_URL=postgresql://civicpulse:civicpulse_dev@localhost:5432/civicpulse
PORT=4000