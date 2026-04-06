import { Router } from "express";

import {
  getAnalyticsSummary,
  getHoldingTime,
  getPerformanceCalendar,
  getPnlSeries,
  getTagInsights,
  getWinLoss
} from "../controllers/analytics.controller.js";

const analyticsRouter = Router();

analyticsRouter.get("/summary", getAnalyticsSummary);
analyticsRouter.get("/performance-calendar", getPerformanceCalendar);
analyticsRouter.get("/tag-insights", getTagInsights);
analyticsRouter.get("/pnl-series", getPnlSeries);
analyticsRouter.get("/holding-time", getHoldingTime);
analyticsRouter.get("/win-loss", getWinLoss);

export { analyticsRouter };
