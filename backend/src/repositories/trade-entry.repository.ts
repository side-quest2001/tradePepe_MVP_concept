import { desc, eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { tradeEntries, type NewTradeEntry } from "../db/schema/trade-entry.schema.js";

class TradeEntryRepository {
  async list() {
    return db.select().from(tradeEntries).orderBy(desc(tradeEntries.openedAt));
  }

  async getById(id: string) {
    const results = await db.select().from(tradeEntries).where(eq(tradeEntries.id, id)).limit(1);
    return results[0] ?? null;
  }

  async create(data: NewTradeEntry) {
    const results = await db.insert(tradeEntries).values(data).returning();
    return results[0];
  }

  async bulkCreate(data: NewTradeEntry[]) {
    if (data.length === 0) {
      return [];
    }

    return db.insert(tradeEntries).values(data).returning();
  }
}

export const tradeEntryRepository = new TradeEntryRepository();
