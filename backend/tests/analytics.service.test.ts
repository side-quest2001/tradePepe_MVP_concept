import { describe, expect, it } from "vitest";

import { AnalyticsService } from "../src/services/analytics.service.js";

import type { AnalyticsFilters, AnalyticsRepository } from "../src/types/analytics.types.js";
import type { OrderGroup } from "../src/db/schema/trading.schema.js";

const fundId = "11111111-1111-4111-8111-111111111111";

function makeClosedGroup(
  id: string,
  overrides: Partial<OrderGroup> = {}
): OrderGroup {
  const firstInteractionDate = overrides.firstInteractionDate ?? new Date("2026-04-01T09:15:00.000Z");
  const lastInteractionDate = overrides.lastInteractionDate ?? new Date("2026-04-01T10:15:00.000Z");

  return {
    id,
    fundId,
    symbol: "BTCUSDT",
    positionType: "long",
    status: "closed",
    firstInteractionDate,
    lastInteractionDate,
    openedAt: firstInteractionDate,
    closedAt: lastInteractionDate,
    openingOrderId: null,
    quantityOpen: "1.00000000",
    quantityClosed: "1.00000000",
    remainingQuantity: "0.00000000",
    grossBuyQuantity: "1.00000000",
    grossSellQuantity: "1.00000000",
    averageEntryPrice: "100.00000000",
    averageExitPrice: "100.00000000",
    realizedPnl: "0.00000000",
    returnStatus: "neutral",
    brokerFees: "0.00000000",
    charges: "0.00000000",
    notes: null,
    metadata: null,
    createdAt: firstInteractionDate,
    updatedAt: lastInteractionDate,
    ...overrides
  };
}

class SeededAnalyticsRepository implements AnalyticsRepository {
  constructor(
    private readonly closedGroups: OrderGroup[],
    private readonly openGroups: OrderGroup[]
  ) {}

  async listClosedOrderGroups(filters: AnalyticsFilters) {
    return this.applyFilters(this.closedGroups, filters);
  }

  async listOpenOrderGroups(filters: AnalyticsFilters) {
    return this.applyFilters(this.openGroups, filters);
  }

  async getSetupTagCounts(filters: AnalyticsFilters) {
    const filtered = await this.listClosedOrderGroups(filters);
    const ids = new Set(filtered.map((group) => group.id));

    const counts = [
      { tagId: "tag-setup-breakout", slug: "breakout", name: "Breakout", count: 3 },
      { tagId: "tag-setup-retest", slug: "retest", name: "Retest", count: 1 }
    ];

    return ids.size > 0 ? counts : [];
  }

  async getReviewTagCounts(filters: AnalyticsFilters) {
    const filtered = await this.listClosedOrderGroups(filters);
    const ids = new Set(filtered.map((group) => group.id));

    const counts = [
      { tagId: "tag-review-fomo", slug: "fomo", name: "FOMO", count: 2 },
      { tagId: "tag-review-patience", slug: "patience", name: "Patience", count: 1 }
    ];

    return ids.size > 0 ? counts : [];
  }

  async getSetupTagInsights(filters: AnalyticsFilters) {
    const counts = await this.getSetupTagCounts(filters);
    return counts.map((item) => ({
      ...item,
      wins: item.count,
      losses: 0,
      neutral: 0
    }));
  }

  async getReviewTagInsights(filters: AnalyticsFilters) {
    const counts = await this.getReviewTagCounts(filters);
    return counts.map((item) => ({
      ...item,
      wins: 0,
      losses: item.count,
      neutral: 0
    }));
  }

  async getDailyPerformanceRows(filters: AnalyticsFilters) {
    const filtered = await this.listClosedOrderGroups(filters);
    const dailyMap = new Map<
      string,
      { pnl: bigint; tradeCount: number; wins: number; losses: number; neutral: number }
    >();

    for (const group of filtered) {
      const date = (group.lastInteractionDate ?? group.firstInteractionDate).toISOString().slice(0, 10);
      const existing =
        dailyMap.get(date) ?? { pnl: 0n, tradeCount: 0, wins: 0, losses: 0, neutral: 0 };
      existing.pnl += BigInt((group.realizedPnl ?? "0.00000000").replace(".", ""));
      existing.tradeCount += 1;
      if (group.returnStatus === "profit") existing.wins += 1;
      if (group.returnStatus === "loss") existing.losses += 1;
      if (group.returnStatus === "neutral") existing.neutral += 1;
      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, value]) => ({
        date,
        pnl: `${value.pnl.toString().slice(0, -8) || "0"}.${value.pnl.toString().slice(-8).padStart(8, "0")}`,
        tradeCount: value.tradeCount,
        wins: value.wins,
        losses: value.losses,
        neutral: value.neutral
      }));
  }

  private applyFilters(groups: OrderGroup[], filters: AnalyticsFilters) {
    return groups.filter((group) => {
      if (filters.fundId && group.fundId !== filters.fundId) return false;
      if (filters.symbol && group.symbol !== filters.symbol.toUpperCase()) return false;
      if (filters.dateFrom && group.firstInteractionDate < filters.dateFrom) return false;
      const endDate = group.lastInteractionDate ?? group.firstInteractionDate;
      if (filters.dateTo && endDate > filters.dateTo) return false;
      return true;
    });
  }
}

describe("AnalyticsService", () => {
  it("builds analytics from grouped trade data", async () => {
    const closedGroups = [
      makeClosedGroup("g1", {
        realizedPnl: "100.00000000",
        returnStatus: "profit",
        firstInteractionDate: new Date("2026-04-01T09:00:00.000Z"),
        lastInteractionDate: new Date("2026-04-01T11:00:00.000Z")
      }),
      makeClosedGroup("g2", {
        realizedPnl: "-50.00000000",
        returnStatus: "loss",
        firstInteractionDate: new Date("2026-04-02T09:00:00.000Z"),
        lastInteractionDate: new Date("2026-04-02T10:00:00.000Z")
      }),
      makeClosedGroup("g3", {
        realizedPnl: "-20.00000000",
        returnStatus: "loss",
        firstInteractionDate: new Date("2026-04-03T09:00:00.000Z"),
        lastInteractionDate: new Date("2026-04-03T12:00:00.000Z")
      }),
      makeClosedGroup("g4", {
        realizedPnl: "0.00000000",
        returnStatus: "neutral",
        firstInteractionDate: new Date("2026-04-04T09:00:00.000Z"),
        lastInteractionDate: new Date("2026-04-04T10:30:00.000Z")
      })
    ];

    const openGroups = [
      {
        ...makeClosedGroup("g-open"),
        status: "open",
        remainingQuantity: "1.00000000",
        realizedPnl: null,
        returnStatus: "neutral",
        lastInteractionDate: null,
        closedAt: null
      }
    ];

    const service = new AnalyticsService(new SeededAnalyticsRepository(closedGroups, openGroups));
    const result = await service.getSummary({ fundId });

    expect(result.pnlSummary).toEqual({
      realizedPnl: "30.00000000",
      unrealizedPnl: null,
      closedTradeCount: 4,
      openTradeCount: 1
    });
    expect(result.winRate).toEqual({
      percentage: 33.33,
      wins: 1,
      losses: 2,
      neutral: 1
    });
    expect(result.averageHoldingTime).toEqual({
      milliseconds: 6750000,
      hours: 1.88
    });
    expect(result.extremes).toEqual({
      maxLossPerTrade: "-50.00000000",
      highestProfit: "100.00000000"
    });
    expect(result.streaks).toEqual({
      currentLossStreak: 0,
      longestLossStreak: 2
    });
    expect(result.tags.mostTradedSetup?.slug).toBe("breakout");
    expect(result.tags.mostCommonReview?.slug).toBe("fomo");
    expect(result.dailyPerformanceCalendar).toHaveLength(4);
    expect(result.dailyPerformanceCalendar[0]).toEqual({
      date: "2026-04-01",
      pnl: "100.00000000",
      tradeCount: 1,
      wins: 1,
      losses: 0,
      neutral: 0
    });
  });

  it("applies symbol and date filters", async () => {
    const closedGroups = [
      makeClosedGroup("g1", {
        symbol: "BTCUSDT",
        realizedPnl: "10.00000000",
        returnStatus: "profit",
        firstInteractionDate: new Date("2026-04-01T09:00:00.000Z"),
        lastInteractionDate: new Date("2026-04-01T10:00:00.000Z")
      }),
      makeClosedGroup("g2", {
        symbol: "ETHUSDT",
        realizedPnl: "-5.00000000",
        returnStatus: "loss",
        firstInteractionDate: new Date("2026-04-10T09:00:00.000Z"),
        lastInteractionDate: new Date("2026-04-10T10:00:00.000Z")
      })
    ];

    const service = new AnalyticsService(new SeededAnalyticsRepository(closedGroups, []));
    const result = await service.getSummary({
      symbol: "BTCUSDT",
      dateFrom: new Date("2026-04-01T00:00:00.000Z"),
      dateTo: new Date("2026-04-02T00:00:00.000Z")
    });

    expect(result.pnlSummary.realizedPnl).toBe("10.00000000");
    expect(result.winRate.wins).toBe(1);
    expect(result.dailyPerformanceCalendar).toHaveLength(1);
    expect(result.dailyPerformanceCalendar[0]?.date).toBe("2026-04-01");
  });
});
