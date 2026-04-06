import { Router } from "express";

import {
  getAnalyticsSummary,
  getHoldingTime,
  getPerformanceCalendar,
  getPnlSeries,
  getTagInsights,
  getWinLoss
} from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get("/summary", requireAuth, getAnalyticsSummary);
analyticsRouter.get("/performance-calendar", requireAuth, getPerformanceCalendar);
analyticsRouter.get("/tag-insights", requireAuth, getTagInsights);
analyticsRouter.get("/pnl-series", requireAuth, getPnlSeries);
analyticsRouter.get("/holding-time", requireAuth, getHoldingTime);
analyticsRouter.get("/win-loss", requireAuth, getWinLoss);

export { analyticsRouter };
