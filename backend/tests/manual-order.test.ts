import { describe, expect, it, vi } from "vitest";

import { JournalService } from "../src/services/journal.service.js";
import { manualOrderSchema } from "../src/validators/journal.validator.js";

import type { JournalRepository, OrderGroupBundle } from "../src/types/journal.types.js";
import type { ManualOrderInput } from "../src/validators/journal.validator.js";
import type { RawOrder } from "../src/db/schema/trading.schema.js";

const fundId = "11111111-1111-4111-8111-111111111111";

function makeManualPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    fundId,
    symbol: "nifty",
    side: "buy",
    orderType: "MARKET",
    productType: "MIS",
    qty: "2.50000000",
    tradedPrice: "125.50000000",
    status: "filled",
    executedAt: "2026-04-05T10:30:00.000Z",
    ...overrides
  };
}

function makeRawOrder(overrides: Partial<RawOrder> = {}): RawOrder {
  return {
    id: "order-1",
    fundId,
    importId: null,
    source: "manual",
    brokerName: null,
    brokerOrderId: null,
    brokerExecutionId: null,
    importRowNumber: null,
    symbol: "NIFTY",
    side: "buy",
    orderTypeRaw: "MARKET",
    productTypeRaw: "MIS",
    quantity: "2.50000000",
    remainingQuantity: "0",
    executedQuantity: "2.50000000",
    limitPrice: null,
    stopPrice: null,
    tradedPrice: "125.50000000",
    statusRaw: "filled",
    normalizedStatus: "filled",
    orderTime: new Date("2026-04-05T10:30:00.000Z"),
    executionTime: new Date("2026-04-05T10:30:00.000Z"),
    rawPayload: {},
    notes: null,
    createdAt: new Date("2026-04-05T10:30:00.000Z"),
    updatedAt: new Date("2026-04-05T10:30:00.000Z"),
    ...overrides
  };
}

function makeOrderGroupBundle(overrides: Partial<OrderGroupBundle> = {}): OrderGroupBundle {
  return {
    group: {
      id: "group-1",
      fundId,
      symbol: "NIFTY",
      positionType: "long",
      status: "open",
      firstInteractionDate: new Date("2026-04-05T10:30:00.000Z"),
      lastInteractionDate: null,
      openedAt: new Date("2026-04-05T10:30:00.000Z"),
      closedAt: null,
      openingOrderId: "order-1",
      quantityOpen: "2.50000000",
      quantityClosed: "0.00000000",
      remainingQuantity: "2.50000000",
      grossBuyQuantity: "2.50000000",
      grossSellQuantity: "0.00000000",
      averageEntryPrice: "125.50000000",
      averageExitPrice: null,
      realizedPnl: null,
      returnStatus: "neutral",
      brokerFees: "0.00000000",
      charges: "0.00000000",
      notes: null,
      metadata: null,
      createdAt: new Date("2026-04-05T10:30:00.000Z"),
      updatedAt: new Date("2026-04-05T10:30:00.000Z")
    },
    orders: [
      {
        ...makeRawOrder(),
        role: "open",
        sequenceNumber: 1,
        signedQuantityDelta: "2.50000000"
      }
    ],
    setupTags: [],
    reviewTags: [],
    notes: [],
    publishedTrade: null,
    ...overrides
  };
}

function createRepositoryMock(): JournalRepository {
  return {
    createManualOrderWithGrouping: vi.fn().mockResolvedValue({
      order: makeRawOrder(),
      orderGroup: makeOrderGroupBundle()
    }),
    listOrders: vi.fn(),
    listOrderGroups: vi.fn(),
    getOrderGroupBundle: vi.fn(),
    updateOrderGroup: vi.fn(),
    createTradeNote: vi.fn(),
    listTradeNotes: vi.fn(),
    getTradeNoteById: vi.fn(),
    updateTradeNote: vi.fn(),
    deleteTradeNote: vi.fn(),
    resolveTradeTag: vi.fn(),
    addSetupTag: vi.fn(),
    addReviewTag: vi.fn(),
    publishTradeGroup: vi.fn(),
    getPublishedTradeGroupByOrderGroupId: vi.fn()
  };
}

describe("manualOrderSchema", () => {
  it("accepts a valid manual buy", () => {
    const parsed = manualOrderSchema.parse(makeManualPayload());

    expect(parsed).toMatchObject({
      symbol: "NIFTY",
      side: "buy",
      qty: "2.50000000",
      tradedPrice: "125.50000000",
      status: "filled"
    });
  });

  it("accepts a valid manual sell", () => {
    const parsed = manualOrderSchema.parse(
      makeManualPayload({
        side: "sell",
        symbol: "banknifty"
      })
    );

    expect(parsed).toMatchObject({
      symbol: "BANKNIFTY",
      side: "sell"
    });
  });

  it("rejects an invalid qty", () => {
    expect(() =>
      manualOrderSchema.parse(
        makeManualPayload({
          qty: "abc"
        })
      )
    ).toThrow();
  });

  it("rejects an invalid side", () => {
    expect(() =>
      manualOrderSchema.parse(
        makeManualPayload({
          side: "hold"
        })
      )
    ).toThrow();
  });

  it("rejects missing tradedPrice", () => {
    const payload = makeManualPayload();
    delete (payload as { tradedPrice?: string }).tradedPrice;

    expect(() => manualOrderSchema.parse(payload)).toThrow();
  });
});

describe("JournalService.createManualOrder", () => {
  it("returns both created raw order and affected order group", async () => {
    const repository = createRepositoryMock();
    const service = new JournalService(repository);
    const input = manualOrderSchema.parse(makeManualPayload()) as ManualOrderInput;

    const result = await service.createManualOrder(input, "user-1");

    expect(repository.createManualOrderWithGrouping).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "manual",
        symbol: "NIFTY",
        side: "buy",
        orderTypeRaw: "MARKET",
        productTypeRaw: "MIS",
        quantity: "2.50000000",
        executedQuantity: "2.50000000",
        tradedPrice: "125.50000000",
        normalizedStatus: "filled"
      }),
      "user-1"
    );
    expect(result.order.symbol).toBe("NIFTY");
    expect(result.orderGroup?.id).toBe("group-1");
  });
});
