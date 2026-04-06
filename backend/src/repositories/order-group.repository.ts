import { and, desc, eq, max } from "drizzle-orm";

import { db } from "../db/client.js";
import { orderGroupOrders, orderGroups } from "../db/schema/trading.schema.js";

import type { DbExecutor } from "../types/db.types.js";
import type { TradeGroupingRepository } from "../types/grouping.types.js";
import type { NewOrderGroup, NewOrderGroupOrder } from "../db/schema/trading.schema.js";

export class OrderGroupRepository implements TradeGroupingRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async findOpenGroupByFundAndSymbol(fundId: string, symbol: string) {
    const results = await this.executor
      .select()
      .from(orderGroups)
      .where(and(eq(orderGroups.fundId, fundId), eq(orderGroups.symbol, symbol), eq(orderGroups.status, "open")))
      .orderBy(desc(orderGroups.createdAt))
      .limit(1);

    return results[0] ?? null;
  }

  async createOrderGroup(input: NewOrderGroup) {
    const results = await this.executor.insert(orderGroups).values(input).returning();
    return results[0];
  }

  async updateOrderGroup(id: string, input: Partial<NewOrderGroup>) {
    const results = await this.executor
      .update(orderGroups)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(orderGroups.id, id))
      .returning();

    return results[0];
  }

  async getNextSequenceNumber(orderGroupId: string) {
    const results = await this.executor
      .select({
        maxSequenceNumber: max(orderGroupOrders.sequenceNumber)
      })
      .from(orderGroupOrders)
      .where(eq(orderGroupOrders.orderGroupId, orderGroupId));

    return (results[0]?.maxSequenceNumber ?? 0) + 1;
  }

  async linkOrderToGroup(input: NewOrderGroupOrder) {
    const results = await this.executor.insert(orderGroupOrders).values(input).returning();
    return results[0];
  }
}
