import { asc, desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { economicIndicatorRows, flashNewsItems } from "../db/schema/app.schema.js";
import type { DbExecutor } from "../types/db.types.js";

export class MarketRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async listFlashNews() {
    return this.executor
      .select()
      .from(flashNewsItems)
      .orderBy(asc(flashNewsItems.sortOrder), desc(flashNewsItems.createdAt));
  }

  async listEconomicIndicators() {
    return this.executor
      .select()
      .from(economicIndicatorRows)
      .orderBy(asc(economicIndicatorRows.sortOrder), asc(economicIndicatorRows.country), asc(economicIndicatorRows.indicator));
  }
}

export const marketRepository = new MarketRepository();
