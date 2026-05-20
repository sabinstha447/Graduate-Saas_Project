# AI Review Log

This document records how AI assistance was used in this project,
what was accepted, what was changed, and what security decisions were made manually.

## Purpose

The job this project was built for requires AI-native development experience
and the ability to review AI-generated code carefully. This log demonstrates
that AI was used as a tool, not a crutch.

---

## Entry 001 — withTenant() helper

**Date:** 2026-05-20
**File:** apps/api/src/db/withTenant.ts
**AI tool:** Claude (claude.ai)

**What AI suggested:**
A withTenant() function that sets app.current_tenant_id using set_config
before running queries inside a transaction.

**What I reviewed:**
- Confirmed the function uses BEGIN/COMMIT/ROLLBACK correctly
- Verified that set_config with the third parameter `true` scopes the
  setting to the current transaction only, not the entire session
- Checked that client.release() is always called in the finally block
  to prevent connection pool exhaustion

**Decision:** Accepted with no changes. The transaction scoping of
set_config is critical for RLS correctness.

---

## Entry 002 — RLS Migration

**Date:** 2026-05-20
**File:** db/migrations/001_init.sql
**AI tool:** Claude (claude.ai)

**What AI suggested:**
RLS policies using current_setting('app.current_tenant_id', true)

**What I reviewed:**
- The second argument `true` to current_setting means it returns NULL
  instead of throwing an error if the setting is not set. This is
  important — without it, queries outside withTenant() would crash
  instead of returning empty results.
- Verified that ENABLE ROW LEVEL SECURITY was applied to all three
  tenant-scoped tables: issues, actions, comments.
- Noted that the tenants table intentionally does NOT have RLS,
  since tenant lookup happens before the tenant context is set.

**Decision:** Accepted. Added manual verification by running RLS
leak tests to confirm policies work as expected.

---

## Entry 003 — Zod validation schema

**Date:** 2026-05-20
**File:** apps/api/src/routes/issues.ts
**AI tool:** Claude (claude.ai)

**What AI suggested:**
A CreateIssueSchema using z.object() with range checks on impact
and likelihood.

**What I reviewed:**
- Confirmed impact and likelihood are validated as integers between 1 and 5
- Confirmed priority is validated as an enum, not a free string
- Noted that risk_score is intentionally excluded from the schema
  because it is a generated column in PostgreSQL — the database
  calculates it automatically. Accepting it from the client would
  be a data integrity risk.
- Confirmed that tenant_id is also excluded from the schema —
  it always comes from the middleware, never from the request body.

**Decision:** Accepted with the explicit note that risk_score and
tenant_id must never be added to this schema.

---

## Entry 004 — RLS Leak Tests

**Date:** 2026-05-20
**File:** apps/api/src/tests/tenant-isolation.test.ts
**AI tool:** Claude (claude.ai)

**What AI suggested:**
Six tests covering tenant isolation, cross-tenant access attempts,
missing header rejection, and dashboard data isolation.

**What I reviewed:**
- Confirmed each test makes assertions about tenant_id on every
  returned row, not just the response status code
- Confirmed the cross-tenant tests actually fetch a real ID from
  one tenant and attempt to access it as another tenant
- Added Number() conversion for total_issues comparison because
  PostgreSQL COUNT() returns strings, not integers, and the
  original toBe() comparison would have been a string comparison

**Decision:** Accepted with the Number() fix applied manually.
This fix was identified during code review before running the tests.

---

## Summary

| Area | AI contribution | Human review action |
|------|----------------|---------------------|
| withTenant() | Suggested pattern | Verified transaction scoping |
| RLS policies | Suggested SQL | Verified NULL-safe current_setting |
| Zod validation | Suggested schema | Removed risk_score and tenant_id |
| RLS tests | Suggested tests | Fixed Number() type conversion |