import { Router } from "express";
import type { Request, Response } from "express";
import { withTenant } from "../db/withTenant";
import { z } from "zod";

const router = Router();

// Validation schema — Zod checks the request body before it touches the database
const CreateIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  location: z.string().optional(),
  impact: z.number().int().min(1).max(5),
  likelihood: z.number().int().min(1).max(5),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
});

// GET /api/issues
router.get("/", async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;

  try {
    const issues = await withTenant(tenantId, async (client) => {
      const result = await client.query(
        `SELECT * FROM issues WHERE tenant_id = $1 ORDER BY created_at DESC`,
        [tenantId]
      );
      return result.rows;
    });

    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

// POST /api/issues
router.post("/", async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;

  // Validate the request body
  const parsed = CreateIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { title, description, category, location, impact, likelihood, priority, status } = parsed.data;

  try {
    const issue = await withTenant(tenantId, async (client) => {
      const result = await client.query(
        `INSERT INTO issues (tenant_id, title, description, category, location, impact, likelihood, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [tenantId, title, description, category, location, impact, likelihood, priority, status ?? "open"]
      );
      return result.rows[0];
    });

    res.status(201).json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue" });
  }
});

export default router;