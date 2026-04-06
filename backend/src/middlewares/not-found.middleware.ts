import type { Request, Response } from "express";
import { buildErrorResponse } from "../utils/error-response.util.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(buildErrorResponse("Route not found", { path: req.originalUrl }, req.id?.toString() ?? null));
}
