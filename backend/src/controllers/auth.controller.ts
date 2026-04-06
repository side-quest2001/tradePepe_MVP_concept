import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";
import {
  forgotPasswordSchema,
  refreshSessionSchema,
  requestEmailVerificationSchema,
  resetPasswordSchema,
  signinSchema,
  signoutSchema,
  signupSchema,
  verifyEmailSchema,
} from "../validators/auth.validator.js";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const payload = signupSchema.parse(req.body);
  const result = await authService.signup(payload);
  res.status(201).json(buildSuccessResponse(result));
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const payload = signinSchema.parse(req.body);
  const result = await authService.signin(payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const payload = refreshSessionSchema.parse(req.body);
  const result = await authService.refresh(payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const payload = forgotPasswordSchema.parse(req.body);
  const result = await authService.forgotPassword(payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const payload = resetPasswordSchema.parse(req.body);
  const result = await authService.resetPassword(payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const requestEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  const payload = requestEmailVerificationSchema.parse(req.body ?? {});
  const result = await authService.requestEmailVerification(req.authUser!.id, payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const payload = verifyEmailSchema.parse(req.body);
  const result = await authService.verifyEmail(payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const signout = asyncHandler(async (req: Request, res: Response) => {
  const payload = signoutSchema.parse(req.body ?? {});
  const result = await authService.signout(req.authUser!.id, payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getCurrentUser(req.authUser!.id);
  res.status(200).json(buildSuccessResponse(result));
});
