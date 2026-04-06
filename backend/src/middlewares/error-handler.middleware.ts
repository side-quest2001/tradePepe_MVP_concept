import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "../config/logger.js";
import { buildErrorResponse } from "../utils/error-response.util.js";
import { ApiError } from "../utils/api-error.js";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const requestId = _req.id?.toString() ?? null;

  if (error instanceof ZodError) {
    _req.log?.warn({ error }, "Validation error");
    res.status(400).json(buildErrorResponse("Validation failed", error.flatten(), requestId));
    return;
  }

  if (error instanceof ApiError) {
    const logMethod = error.statusCode >= 500 ? "error" : "warn";
    _req.log?.[logMethod]({ error }, "Handled API error");
    res.status(error.statusCode).json(buildErrorResponse(error.message, error.details ?? null, requestId));
    return;
  }

  if (error instanceof multer.MulterError) {
    _req.log?.warn({ error }, "Upload handling error");
    res.status(400).json(buildErrorResponse("Invalid upload payload", { code: error.code }, requestId));
    return;
  }

  logger.error({ error, requestId }, "Unhandled application error");

  res.status(500).json(buildErrorResponse("Internal server error", null, requestId));
}
