# CivicPulse Architecture

## Overview

CivicPulse is a multi-tenant SaaS application. Each organisation
is a tenant and can only see their own data. Tenant isolation is
enforced at the PostgreSQL level using Row-Level Security (RLS).

## System Diagram
rowser (React + Vite)
│
│  HTTP + x-tenant-id header
▼
Express API (Node.js + TypeScript)
│
│  tenantMiddleware extracts tenant ID
│  withTenant() sets app.current_tenant_id
▼
PostgreSQL (Docker locally / Neon in production)
│
│  RLS policies enforce tenant isolation
│  risk_score generated automatically
▼
Data returned to API → JSON response → Browser

## Multi-Tenancy Design

Each tenant-scoped table has a tenant_id column and an RLS policy:

```sql
CREATE POLICY tenant_isolation_issues
  ON issues
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

The backend sets this value before every query using withTenant():

```typescript
await client.query(
  "SELECT set_config('app.current_tenant_id', $1, true)",
  [tenantId]
);
```

This means even if application code has a bug, the database will
never return another tenant's data.

## Risk Score

Risk score is calculated automatically by PostgreSQL as a generated column:

```sql
risk_score INT GENERATED ALWAYS AS (impact * likelihood) STORED
```

This cannot be overridden by the API or client.

## Tenant Identification (Current)

Tenant ID is passed via the x-tenant-id request header.
This simulates authentication for the MVP. A full implementation
would extract the tenant ID from a verified JWT token.

## Deployment

| Environment | Service |
|-------------|---------|
| Local DB    | Docker Compose (PostgreSQL 16) |
| Production DB | Neon (free PostgreSQL) |
| Backend     | Render (free tier) |
| Frontend    | Vercel (free tier) |

This architecture is intentionally Azure-compatible. The same
setup can be moved to Azure App Service and Azure Database for
PostgreSQL without code changes.

## CI/CD

GitHub Actions runs on every push to main:
1. Spins up a real PostgreSQL 16 instance
2. Runs the migration
3. Seeds test data
4. Runs 6 RLS leak tests