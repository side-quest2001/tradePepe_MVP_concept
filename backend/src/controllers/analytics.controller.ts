import type { Request, Response } from "express";

import { analyticsService } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";
import { analyticsQuerySchema } from "../validators/resource.validator.js";

export const getAnalyticsSummary = asyncHandler(async (req: Request, res: Response) => {
  const query = analyticsQuerySchema.parse(req.query);
  const result = await analyticsService.getSummaryApi(query);
  res.status(200).json(buildSuccessResponse(result));
});

export const getPerformanceCalendar = asyncHandler(async (req: Request, res: Response) => {
  const query = analyticsQuerySchema.parse(req.query);
  const result = await analyticsService.getPerformanceCalendar(query);
  res.status(200).json(buildSuccessResponse(result));
});

export const getTagInsights = asyncHandler(async (req: Request, res: Response) => {
  const query = analyticsQuerySchema.parse(req.query);
  const result = await analyticsService.getTagInsights(query);
  res.status(200).json(buildSuccessResponse(result));
});

export const getPnlSeries = asyncHandler(async (req: Request, res: Response) => {
  const query = analyticsQuerySchema.parse(req.query);
  const result = await analyticsService.getPnlSeries(query);
  res.status(200).json(buildSuccessResponse(result));
});

export const getHoldingTime = asyncHandler(async (req: Request, res: Response) => {
  const query = analyticsQuerySchema.parse(req.query);
  const result = await analyticsService.getHoldingTime(query);
  res.status(200).json(buildSuccessResponse(result));
});

export const getWinLoss = asyncHandler(async (req: Request, res: Response) => {
  const query = analyticsQuerySchema.parse(req.query);
  const result = await analyticsService.getWinLoss(query);
  res.status(200).json(buildSuccessResponse(result));
});
