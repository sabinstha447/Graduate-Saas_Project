import { Request, Response, NextFunction } from "express";

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tenantId = req.headers["x-tenant-id"] as string;

  if (!tenantId) {
    res.status(400).json({ error: "Missing x-tenant-id header" });
    return;
  }

  (req as any).tenantId = tenantId;
  next();
}