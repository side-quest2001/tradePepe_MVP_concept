import type { Request, Response, NextFunction } from "express";
import { authRepository } from "../repositories/auth.repository.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { buildErrorResponse } from "../utils/error-response.util.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    res.status(401).json(buildErrorResponse("Authentication required"));
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json(buildErrorResponse("Invalid or expired access token"));
    return;
  }

  const user = await authRepository.findUserById(payload.sub);
  if (!user) {
    res.status(401).json(buildErrorResponse("User not found"));
    return;
  }

  req.authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    activeSince: user.activeSince,
    bio: user.bio,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null
  };
  next();
}
