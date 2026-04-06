import { Router } from "express";
import {
  createCommunityComment,
  listCommunityComments,
  listCommunityFeed,
  toggleCommunityReaction,
} from "../controllers/community.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const communityRouter = Router();

communityRouter.get("/feed", listCommunityFeed);
communityRouter.get("/posts/:id/comments", listCommunityComments);
communityRouter.post("/posts/:id/comments", requireAuth, createCommunityComment);
communityRouter.post("/posts/:id/reactions", requireAuth, toggleCommunityReaction);

export { communityRouter };
