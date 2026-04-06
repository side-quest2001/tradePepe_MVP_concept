import { beforeEach, describe, expect, it } from "vitest";

import { TradeGroupingService } from "../src/services/trade-grouping.service.js";

import type { NewOrderGroup, NewOrderGroupOrder, OrderGroup, OrderGroupOrder } from "../src/db/schema/trading.schema.js";
import type { GroupingOrderInput, TradeGroupingRepository } from "../src/types/grouping.types.js";

class InMemoryTradeGroupingRepository implements TradeGroupingRepository {
  public readonly groups: OrderGroup[] = [];
  public readonly links: OrderGroupOrder[] = [];
  private groupCounter = 0;

  async findOpenGroupByFundAndSymbol(fundId: string, symbol: string) {
    return this.groups.find((group) => group.fundId === fundId && group.symbol === symbol && group.status === "open") ?? null;
  }

  async createOrderGroup(input: NewOrderGroup) {
    const group: OrderGroup = {
      ...input,
      id: `group-${++this.groupCounter}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.groups.push(group);
    return group;
  }

  async updateOrderGroup(id: string, input: Partial<OrderGroup>) {
    const group = this.groups.find((entry) => entry.id === id);

    if (!group) {
      throw new Error(`Group not found: ${id}`);
    }

    Object.assign(group, input, {
      updatedAt: new Date()
    });

    return group;
  }

  async getNextSequenceNumber(orderGroupId: string) {
    return this.links.filter((link) => link.orderGroupId === orderGroupId).length + 1;
  }

  async linkOrderToGroup(input: NewOrderGroupOrder) {
    const link: OrderGroupOrder = {
      ...input,
      linkedAt: new Date()
    };

    this.links.push(link);
    return link;
  }
}

function makeOrder(overrides: Partial<GroupingOrderInput>): GroupingOrderInput {
  return {
    id: crypto.randomUUID(),
    fundId: "fund-1",
    symbol: "BTCUSDT",
    side: "buy",
    executedQuantity: "1.00000000",
    tradedPrice: "100.00000000",
    executionTime: new Date("2026-04-05T10:00:00.000Z"),
    orderTime: new Date("2026-04-05T10:00:00.000Z"),
    normalizedStatus: "filled",
    ...overrides
  };
}

describe("TradeGroupingService", () => {
  let repository: InMemoryTradeGroupingRepository;
  let service: TradeGroupingService;

  beforeEach(() => {
    repository = new InMemoryTradeGroupingRepository();
    service = new TradeGroupingService(repository);
  });

  it("handles long open and close", async () => {
    await service.processOrder(makeOrder({ side: "buy", tradedPrice: "100.00000000" }));
    const result = await service.processOrder(
      makeOrder({
        side: "sell",
        tradedPrice: "110.00000000",
        executionTime: new Date("2026-04-05T11:00:00.000Z"),
        orderTime: new Date("2026-04-05T11:00:00.000Z")
      })
    );

    expect(result).toMatchObject({
      status: "closed",
      remainingQuantity: "0.00000000",
      realizedPnl: "10.00000000",
      returnStatus: "profit"
    });
  });

  it("handles short open and close", async () => {
    await service.processOrder(makeOrder({ side: "sell", tradedPrice: "100.00000000" }));
    const result = await service.processOrder(
      makeOrder({
        side: "buy",
        tradedPrice: "90.00000000",
        executionTime: new Date("2026-04-05T11:00:00.000Z"),
        orderTime: new Date("2026-04-05T11:00:00.000Z")
      })
    );

    expect(result).toMatchObject({
      status: "closed",
      remainingQuantity: "0.00000000",
      realizedPnl: "10.00000000",
      returnStatus: "profit"
    });
  });

  it("handles partial exits and keeps group open", async () => {
    await service.processOrder(makeOrder({ side: "buy", executedQuantity: "2.00000000", tradedPrice: "100.00000000" }));
    const result = await service.processOrder(
      makeOrder({
        side: "sell",
        executedQuantity: "1.00000000",
        tradedPrice: "110.00000000",
        executionTime: new Date("2026-04-05T11:00:00.000Z"),
        orderTime: new Date("2026-04-05T11:00:00.000Z")
      })
    );

    expect(result).toMatchObject({
      status: "open",
      remainingQuantity: "1.00000000",
      realizedPnl: null,
      returnStatus: "neutral"
    });
  });

  it("handles breakeven close", async () => {
    await service.processOrder(makeOrder({ side: "buy", tradedPrice: "100.00000000" }));
    const result = await service.processOrder(
      makeOrder({
        side: "sell",
        tradedPrice: "100.00000000",
        executionTime: new Date("2026-04-05T11:00:00.000Z"),
        orderTime: new Date("2026-04-05T11:00:00.000Z")
      })
    );

    expect(result).toMatchObject({
      status: "closed",
      remainingQuantity: "0.00000000",
      realizedPnl: "0.00000000",
      returnStatus: "neutral"
    });
  });

  it("rejects invalid over-close situations", async () => {
    await service.processOrder(makeOrder({ side: "buy", executedQuantity: "1.00000000" }));

    await expect(
      service.processOrder(
        makeOrder({
          side: "sell",
          executedQuantity: "2.00000000",
          tradedPrice: "90.00000000",
          executionTime: new Date("2026-04-05T11:00:00.000Z"),
          orderTime: new Date("2026-04-05T11:00:00.000Z")
        })
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Order would over-close the existing position group"
    });
  });
});
