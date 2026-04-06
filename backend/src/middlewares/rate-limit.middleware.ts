import type { Request, RequestHandler } from "express";

import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIdentifier(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function createRateLimitMiddleware(options?: {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
}): RequestHandler {
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS;
  const keyPrefix = options?.keyPrefix ?? "global";

  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${getClientIdentifier(req)}`;
    const currentEntry = rateLimitStore.get(key);

    if (!currentEntry || currentEntry.expiresAt <= now) {
      rateLimitStore.set(key, {
        count: 1,
        expiresAt: now + windowMs
      });
      next();
      return;
    }

    if (currentEntry.count >= maxRequests) {
      res.setHeader("Retry-After", Math.ceil((currentEntry.expiresAt - now) / 1000));
      next(new ApiError(429, "Too many requests"));
      return;
    }

    currentEntry.count += 1;
    rateLimitStore.set(key, currentEntry);
    next();
  };
}
