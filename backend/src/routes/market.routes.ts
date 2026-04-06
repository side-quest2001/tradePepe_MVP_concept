import { Router } from "express";
import { listEconomicIndicators, listFlashNews } from "../controllers/market.controller.js";

const marketRouter = Router();

marketRouter.get("/flash-news", listFlashNews);
marketRouter.get("/economic-indicators", listEconomicIndicators);

export { marketRouter };
