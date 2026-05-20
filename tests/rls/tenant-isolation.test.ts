import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import express from "express";
import cors from "cors";
import { tenantMiddleware } from "../../apps/api/src/middleware/tenant";
import issuesRouter from "../../apps/api/src/routes/issues";
import dashboardRouter from "../../apps/api/src/routes/dashboard";

// Known tenant IDs from seed data
const TENANT_1 = "a0000000-0000-0000-0000-000000000001";
const TENANT_2 = "a0000000-0000-0000-0000-000000000002";

// Build the Express app for testing
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", tenantMiddleware);
app.use("/api/issues", issuesRouter);
app.use("/api/dashboard", dashboardRouter);

const request = supertest(app);

describe("RLS Tenant Isolation", () => {

  it("tenant 1 can see their own issues", async () => {
    const res = await request
      .get("/api/issues")
      .set("x-tenant-id", TENANT_1);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    // Every issue must belong to tenant 1
    for (const issue of res.body) {
      expect(issue.tenant_id).toBe(TENANT_1);
    }
  });

  it("tenant 2 can see their own issues", async () => {
    const res = await request
      .get("/api/issues")
      .set("x-tenant-id", TENANT_2);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    // Every issue must belong to tenant 2
    for (const issue of res.body) {
      expect(issue.tenant_id).toBe(TENANT_2);
    }
  });

  it("tenant 1 cannot see tenant 2 issues", async () => {
    // Get tenant 2's issues first
    const tenant2Issues = await request
      .get("/api/issues")
      .set("x-tenant-id", TENANT_2);

    const tenant2IssueId = tenant2Issues.body[0].id;

    // Try to access tenant 2's issue as tenant 1
    const res = await request
      .get(`/api/issues/${tenant2IssueId}`)
      .set("x-tenant-id", TENANT_1);

    expect(res.status).toBe(404);
  });

  it("tenant 2 cannot see tenant 1 issues", async () => {
    // Get tenant 1's issues first
    const tenant1Issues = await request
      .get("/api/issues")
      .set("x-tenant-id", TENANT_1);

    const tenant1IssueId = tenant1Issues.body[0].id;

    // Try to access tenant 1's issue as tenant 2
    const res = await request
      .get(`/api/issues/${tenant1IssueId}`)
      .set("x-tenant-id", TENANT_2);

    expect(res.status).toBe(404);
  });

  it("request without tenant header is rejected", async () => {
    const res = await request.get("/api/issues");
    expect(res.status).toBe(400);
  });

  it("dashboard summary only shows current tenant data", async () => {
    const res1 = await request
      .get("/api/dashboard/summary")
      .set("x-tenant-id", TENANT_1);

    const res2 = await request
      .get("/api/dashboard/summary")
      .set("x-tenant-id", TENANT_2);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Tenant counts must be different
    expect(res1.body.total_issues).not.toBe(res2.body.total_issues);
  });

});