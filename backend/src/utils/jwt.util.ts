import { createHmac } from "node:crypto";
import { env } from "../config/env.js";
import type { AuthTokenPayload } from "../types/auth.types.js";

function base64url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret)
    .update(value)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createAccessToken(input: Omit<AuthTokenPayload, "exp" | "type">) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      ...input,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + env.AUTH_ACCESS_TTL_SECONDS,
    })
  );
  const signature = sign(`${header}.${payload}`, env.AUTH_ACCESS_SECRET);
  return `${header}.${payload}.${signature}`;
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const expected = sign(`${header}.${payload}`, env.AUTH_ACCESS_SECRET);
  if (expected !== signature) return null;
  const decoded = JSON.parse(base64urlDecode(payload)) as AuthTokenPayload;
  if (decoded.type !== "access" || decoded.exp < Math.floor(Date.now() / 1000)) return null;
  return decoded;
}
