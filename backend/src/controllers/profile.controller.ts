import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";
import { profileService } from "../services/profile.service.js";
import { idParamSchema } from "../validators/resource.validator.js";
import { z } from "zod";
import { mediaService } from "../services/media.service.js";

const handleParamSchema = z.object({
  handle: z.string().trim().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  handle: z.string().trim().min(1).max(40).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional()
});

const mediaSignatureSchema = z.object({
  kind: z.enum(["avatar", "cover", "shared-trade"])
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await profileService.getMyProfile(req.authUser!.id);
  res.status(200).json(buildSuccessResponse(result));
});

export const getProfileByHandle = asyncHandler(async (req: Request, res: Response) => {
  const params = handleParamSchema.parse(req.params);
  const result = await profileService.getPublicProfile(params.handle);
  res.status(200).json(buildSuccessResponse(result));
});

export const toggleProfileFollow = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const result = await profileService.toggleFollow(params.id, req.authUser!.id);
  res.status(200).json(buildSuccessResponse(result));
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body);
  const result = await profileService.updateMyProfile(req.authUser!.id, input);
  res.status(200).json(buildSuccessResponse(result));
});

export const getProfileMediaSignature = asyncHandler(async (req: Request, res: Response) => {
  const input = mediaSignatureSchema.parse(req.body);
  const result = mediaService.getUploadSignature(input.kind);
  res.status(200).json(buildSuccessResponse(result));
});
