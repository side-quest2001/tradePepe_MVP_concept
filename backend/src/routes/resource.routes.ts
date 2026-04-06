import { Router } from "express";

import {
  createFund,
  createTag,
  deleteNote,
  getImportById,
  listFunds,
  listImports,
  listTags,
  patchFund,
  patchNote,
  patchTag
} from "../controllers/resource.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";

const resourceRouter = Router();

resourceRouter.get("/tags", listTags);
resourceRouter.post("/tags", requireAuth, createRateLimitMiddleware({ keyPrefix: "create-tag", maxRequests: 30 }), createTag);
resourceRouter.patch("/tags/:id", requireAuth, createRateLimitMiddleware({ keyPrefix: "patch-tag", maxRequests: 30 }), patchTag);

resourceRouter.get("/funds", listFunds);
resourceRouter.post("/funds", requireAuth, createRateLimitMiddleware({ keyPrefix: "create-fund", maxRequests: 20 }), createFund);
resourceRouter.patch("/funds/:id", requireAuth, createRateLimitMiddleware({ keyPrefix: "patch-fund", maxRequests: 20 }), patchFund);

resourceRouter.get("/imports", listImports);
resourceRouter.get("/imports/:id", getImportById);

resourceRouter.patch("/notes/:id", requireAuth, createRateLimitMiddleware({ keyPrefix: "patch-note", maxRequests: 60 }), patchNote);
resourceRouter.delete("/notes/:id", requireAuth, createRateLimitMiddleware({ keyPrefix: "delete-note", maxRequests: 60 }), deleteNote);

export { resourceRouter };
