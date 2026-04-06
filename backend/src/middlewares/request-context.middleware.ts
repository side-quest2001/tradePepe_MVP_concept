import type { Request, Response, NextFunction } from "express";

export function attachRequestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.id?.toString() ?? crypto.randomUUID();
  res.setHeader("x-request-id", requestId);
  next();
}
