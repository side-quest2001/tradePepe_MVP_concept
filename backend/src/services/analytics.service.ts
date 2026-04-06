import { analyticsRepository } from "../repositories/analytics.repository.js";
import {
  mapDailyPerformanceCalendar,
  mapHoldingTime,
  mapPerformanceCalendar,
  mapPnlSeries,
  mapSummaryForApi,
  mapWinLoss
} from "../mappers/analytics.mapper.js";
import { addDecimalStrings, compareDecimalStrings } from "../utils/pnl.util.js";

import type {
  AnalyticsFilters,
  AnalyticsRepository,
  AnalyticsSummaryDto,
  TagInsightsDto
} from "../types/analytics.types.js";
import type { OrderGroup } from "../db/schema/trading.schema.js";

function sumRealizedPnl(groups: OrderGroup[]): string {
  return groups.reduce((total, group) => addDecimalStrings(total, group.realizedPnl ?? "0.00000000"), "0.00000000");
}

function calculateAverageHoldingTime(groups: OrderGroup[]) {
  if (groups.length === 0) {
    return {
      milliseconds: 0,
      hours: 0
    };
  }

  const totalMilliseconds = groups.reduce((total, group) => {
    const endDate = group.lastInteractionDate ?? group.closedAt ?? group.firstInteractionDate;
    return total + Math.max(0, endDate.getTime() - group.firstInteractionDate.getTime());
  }, 0);
  const averageMilliseconds = Math.round(totalMilliseconds / groups.length);

  return {
    milliseconds: averageMilliseconds,
    hours: Number((averageMilliseconds / 3600000).toFixed(2))
  };
}

function findExtreme(groups: OrderGroup[], mode: "min" | "max"): string | null {
  if (groups.length === 0) {
    return null;
  }

  let result = groups[0]?.realizedPnl ?? "0.00000000";

  for (const group of groups) {
    const pnl = group.realizedPnl ?? "0.00000000";
    const comparison = compareDecimalStrings(pnl, result);

    if ((mode === "min" && comparison < 0) || (mode === "max" && comparison > 0)) {
      result = pnl;
    }
  }

  return result;
}

function calculateLossStreak(groups: OrderGroup[]) {
  const sortedGroups = groups
    .slice()
    .sort((left, right) => left.firstInteractionDate.getTime() - right.firstInteractionDate.getTime());

  let currentLossStreak = 0;
  let longestLossStreak = 0;

  for (const group of sortedGroups) {
    if (group.returnStatus === "loss") {
      currentLossStreak += 1;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
      continue;
    }

    currentLossStreak = 0;
  }

  let trailingLossStreak = 0;
  for (let index = sortedGroups.length - 1; index >= 0; index -= 1) {
    if (sortedGroups[index]?.returnStatus === "loss") {
      trailingLossStreak += 1;
    } else {
      break;
    }
  }

  return {
    currentLossStreak: trailingLossStreak,
    longestLossStreak
  };
}

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository = analyticsRepository) {}

  async getSummary(filters: AnalyticsFilters): Promise<AnalyticsSummaryDto> {
    const [closedGroups, openGroups, setupTagCounts, reviewTagCounts, dailyPerformanceRows] = await Promise.all([
      this.repository.listClosedOrderGroups(filters),
      this.repository.listOpenOrderGroups(filters),
      this.repository.getSetupTagCounts(filters),
      this.repository.getReviewTagCounts(filters),
      this.repository.getDailyPerformanceRows(filters)
    ]);

    const wins = closedGroups.filter((group) => group.returnStatus === "profit").length;
    const losses = closedGroups.filter((group) => group.returnStatus === "loss").length;
    const neutral = closedGroups.filter((group) => group.returnStatus === "neutral").length;
    const winRateBase = wins + losses;
    const winRate = winRateBase === 0 ? 0 : Number(((wins / winRateBase) * 100).toFixed(2));

    return {
      pnlSummary: {
        realizedPnl: sumRealizedPnl(closedGroups),
        unrealizedPnl: null,
        closedTradeCount: closedGroups.length,
        openTradeCount: openGroups.length
      },
      winRate: {
        percentage: winRate,
        wins,
        losses,
        neutral
      },
      averageHoldingTime: calculateAverageHoldingTime(closedGroups),
      extremes: {
        maxLossPerTrade: findExtreme(closedGroups, "min"),
        highestProfit: findExtreme(closedGroups, "max")
      },
      streaks: calculateLossStreak(closedGroups),
      tags: {
        mostTradedSetup: setupTagCounts[0] ?? null,
        mostCommonReview: reviewTagCounts[0] ?? null
      },
      dailyPerformanceCalendar: mapDailyPerformanceCalendar(dailyPerformanceRows)
    };
  }

  async getSummaryApi(filters: AnalyticsFilters) {
    const summary = await this.getSummary(filters);
    return mapSummaryForApi(summary);
  }

  async getPerformanceCalendar(filters: AnalyticsFilters) {
    const rows = await this.repository.getDailyPerformanceRows(filters);
    return mapPerformanceCalendar(rows);
  }

  async getTagInsights(filters: AnalyticsFilters): Promise<TagInsightsDto> {
    const [setup, review] = await Promise.all([
      this.repository.getSetupTagInsights(filters),
      this.repository.getReviewTagInsights(filters)
    ]);

    return { setup, review };
  }

  async getPnlSeries(filters: AnalyticsFilters) {
    const rows = await this.repository.getDailyPerformanceRows(filters);
    return mapPnlSeries(rows);
  }

  async getHoldingTime(filters: AnalyticsFilters) {
    const closedGroups = await this.repository.listClosedOrderGroups(filters);
    return mapHoldingTime(closedGroups);
  }

  async getWinLoss(filters: AnalyticsFilters) {
    const summary = await this.getSummary(filters);
    return mapWinLoss(summary);
  }
}

export const analyticsService = new AnalyticsService();
