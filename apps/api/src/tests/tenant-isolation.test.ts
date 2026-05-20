import { describe, it, expect } from "vitest";
import supertest from "supertest";
import express from "express";
import cors from "cors";
import { tenantMiddleware } from "../middleware/tenant";
import issuesRouter from "../routes/issues";
import dashboardRouter from "../routes/dashboard";

const TENANT_1 = "a0000000-0000-0000-0000-000000000001";
const TENANT_2 = "a0000000-0000-0000-0000-000000000002";

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

    for (const issue of res.body) {
      expect(issue.tenant_id).toBe(TENANT_2);
    }
  });

  it("tenant 1 cannot see tenant 2 issues", async () => {
    const tenant2Issues = await request
      .get("/api/issues")
      .set("x-tenant-id", TENANT_2);

    const tenant2IssueId = tenant2Issues.body[0].id;

    const res = await request
      .get(`/api/issues/${tenant2IssueId}`)
      .set("x-tenant-id", TENANT_1);

    expect(res.status).toBe(404);
  });

  it("tenant 2 cannot see tenant 1 issues", async () => {
    const tenant1Issues = await request
      .get("/api/issues")
      .set("x-tenant-id", TENANT_1);

    const tenant1IssueId = tenant1Issues.body[0].id;

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

    expect(Number(res1.body.total_issues)).not.toBe(Number(res2.body.total_issues));
  });

});