import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  handle: z.string().trim().min(2).max(40),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const signinSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(20),
});

export const signoutSchema = z.object({
  refreshToken: z.string().min(20).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});

export const requestEmailVerificationSchema = z.object({
  email: z.string().trim().email().optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;
export type SignoutInput = z.infer<typeof signoutSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RequestEmailVerificationInput = z.infer<typeof requestEmailVerificationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
