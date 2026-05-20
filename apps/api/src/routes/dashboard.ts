import { Router } from "express";
import type { Request, Response } from "express";
import { withTenant } from "../db/withTenant";

const router = Router();

// GET /api/dashboard/summary
router.get("/summary", async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;

  try {
    const summary = await withTenant(tenantId, async (client) => {
      const result = await client.query(
        `SELECT
          COUNT(*)                                            AS total_issues,
          COUNT(*) FILTER (WHERE status = 'open')            AS open_issues,
          COUNT(*) FILTER (WHERE priority = 'critical')      AS critical_issues,
          COUNT(*) FILTER (WHERE priority = 'high')          AS high_issues,
          ROUND(AVG(risk_score), 1)                          AS avg_risk_score,
          MAX(risk_score)                                     AS max_risk_score
        FROM issues
        WHERE tenant_id = $1`,
        [tenantId]
      );
      return result.rows[0];
    });

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

export default router;