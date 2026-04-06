import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";
import { marketService } from "../services/market.service.js";

export const listFlashNews = asyncHandler(async (_req: Request, res: Response) => {
  const result = await marketService.listFlashNews();
  res.status(200).json(buildSuccessResponse(result));
});

export const listEconomicIndicators = asyncHandler(async (_req: Request, res: Response) => {
  const result = await marketService.listEconomicIndicators();
  res.status(200).json(buildSuccessResponse(result));
});
