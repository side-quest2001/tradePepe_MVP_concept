import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(60),
  TRUST_PROXY: z.union([z.literal("true"), z.literal("false")]).default("false"),
  POSTGRES_DB: z.string().min(1).default("tradepepe"),
  POSTGRES_USER: z.string().min(1).default("tradepepe"),
  POSTGRES_PASSWORD: z.string().min(1).default("tradepepe"),
  AUTH_ACCESS_SECRET: z.string().min(16).default("tradepepe-access-secret"),
  AUTH_REFRESH_SECRET: z.string().min(16).default("tradepepe-refresh-secret"),
  AUTH_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  AUTH_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),
  MARKETAUX_API_TOKEN: z.string().default(""),
  MARKETAUX_NEWS_LIMIT: z.coerce.number().int().positive().default(3),
  ALPHA_VANTAGE_API_KEY: z.string().default(""),
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
  MARKET_NEWS_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 15),
  MARKET_ECONOMIC_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
