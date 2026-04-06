import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";
import { communityService } from "../services/community.service.js";
import { createCommentSchema } from "../validators/auth.validator.js";
import { idParamSchema } from "../validators/resource.validator.js";

export const listCommunityFeed = asyncHandler(async (_req: Request, res: Response) => {
  const result = await communityService.listFeed();
  res.status(200).json(buildSuccessResponse(result));
});

export const listCommunityComments = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const result = await communityService.listComments(params.id);
  res.status(200).json(buildSuccessResponse(result));
});

export const createCommunityComment = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const payload = createCommentSchema.parse(req.body);
  const result = await communityService.createComment(params.id, req.authUser!.id, payload.content);
  res.status(201).json(buildSuccessResponse(result));
});

export const toggleCommunityReaction = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const result = await communityService.toggleReaction(params.id, req.authUser!.id);
  res.status(200).json(buildSuccessResponse(result));
});
