import { Router } from "express";

import {
  addOrderGroupReviewTag,
  addOrderGroupSetupTag,
  createManualOrder,
  createOrderGroupNote,
  getOrderGroupChart,
  getOrderGroupById,
  getOrderGroupNotes,
  getPublishedOrderGroup,
  listOrderGroups,
  listOrders,
  patchPublishedOrderGroup,
  patchOrderGroup,
  publishOrderGroup
} from "../controllers/journal.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";

const journalRouter = Router();

journalRouter.post("/orders/manual", createRateLimitMiddleware({ keyPrefix: "manual-order", maxRequests: 30 }), createManualOrder);
journalRouter.get("/orders", listOrders);
journalRouter.get("/order-groups", listOrderGroups);
journalRouter.get("/order-groups/:id", getOrderGroupById);
journalRouter.get("/order-groups/:id/notes", getOrderGroupNotes);
journalRouter.get("/order-groups/:id/chart", getOrderGroupChart);
journalRouter.get("/order-groups/:id/publish", getPublishedOrderGroup);
journalRouter.patch("/order-groups/:id", createRateLimitMiddleware({ keyPrefix: "patch-order-group", maxRequests: 60 }), patchOrderGroup);
journalRouter.post("/order-groups/:id/notes", createRateLimitMiddleware({ keyPrefix: "group-notes", maxRequests: 60 }), createOrderGroupNote);
journalRouter.post("/order-groups/:id/setup-tags", createRateLimitMiddleware({ keyPrefix: "group-setup-tags", maxRequests: 60 }), addOrderGroupSetupTag);
journalRouter.post("/order-groups/:id/review-tags", createRateLimitMiddleware({ keyPrefix: "group-review-tags", maxRequests: 60 }), addOrderGroupReviewTag);
journalRouter.post("/order-groups/:id/publish", requireAuth, createRateLimitMiddleware({ keyPrefix: "group-publish", maxRequests: 20 }), publishOrderGroup);
journalRouter.patch("/order-groups/:id/publish", requireAuth, createRateLimitMiddleware({ keyPrefix: "group-publish-patch", maxRequests: 20 }), patchPublishedOrderGroup);

export { journalRouter };
