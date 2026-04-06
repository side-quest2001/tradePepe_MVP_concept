import { sql } from "drizzle-orm";

import { env } from "../config/env.js";
import { db } from "../db/client.js";

class HealthService {
  async getStatus() {
    if (env.NODE_ENV === "test") {
      return {
        status: "ok",
        database: "skipped",
        environment: env.NODE_ENV,
        uptime: process.uptime()
      };
    }

    try {
      await db.execute(sql`select 1`);

      return {
        status: "ok",
        database: "up",
        environment: env.NODE_ENV,
        uptime: process.uptime()
      };
    } catch {
      return {
        status: "degraded",
        database: "down",
        environment: env.NODE_ENV,
        uptime: process.uptime()
      };
    }
  }
}

export const healthService = new HealthService();
