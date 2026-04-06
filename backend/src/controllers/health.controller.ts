import type { Request, Response } from "express";

import { healthService } from "../services/health.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const result = await healthService.getStatus();
  const statusCode = result.status === "ok" ? 200 : 503;

  res.status(statusCode).json(buildSuccessResponse(result));
});
