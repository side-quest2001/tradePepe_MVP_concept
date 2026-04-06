import {
  addDecimalStrings,
  decimalToScaledInteger,
  scaledIntegerToDecimal
} from "../utils/pnl.util.js";

import type {
  AnalyticsSummaryDto,
  DailyPerformanceRow,
  HoldingTimeDto,
  PerformanceCalendarDto,
  PnlSeriesPointDto,
  SummaryApiDto,
  WinLossDto
} from "../types/analytics.types.js";

export function mapDailyPerformanceCalendar(rows: DailyPerformanceRow[]): AnalyticsSummaryDto["dailyPerformanceCalendar"] {
  return rows.map((row) => ({
    date: row.date,
    pnl: row.pnl,
    tradeCount: row.tradeCount,
    wins: row.wins,
    losses: row.losses,
    neutral: row.neutral
  }));
}

export function mapSummaryForApi(summary: AnalyticsSummaryDto): SummaryApiDto {
  return {
    totalRealizedPnl: summary.pnlSummary.realizedPnl,
    totalClosedTrades: summary.pnlSummary.closedTradeCount,
    winRate: summary.winRate.percentage,
    avgHoldingTimeMinutes: Math.round(summary.averageHoldingTime.milliseconds / 60000),
    maxLoss: summary.extremes.maxLossPerTrade,
    maxProfit: summary.extremes.highestProfit
  };
}

export function mapPerformanceCalendar(rows: DailyPerformanceRow[]): PerformanceCalendarDto[] {
  return mapDailyPerformanceCalendar(rows);
}

export function mapPnlSeries(rows: DailyPerformanceRow[]): PnlSeriesPointDto[] {
  let cumulativePnl = "0.00000000";

  return rows.map((row) => {
    cumulativePnl = addDecimalStrings(cumulativePnl, row.pnl);

    return {
      date: row.date,
      pnl: row.pnl,
      cumulativePnl,
      tradeCount: row.tradeCount
    };
  });
}

export function mapHoldingTime(groups: Array<{ firstInteractionDate: Date; lastInteractionDate: Date | null; closedAt: Date | null }>): HoldingTimeDto {
  if (groups.length === 0) {
    return {
      avgMinutes: 0,
      minMinutes: null,
      maxMinutes: null
    };
  }

  const values = groups.map((group) => {
    const endDate = group.lastInteractionDate ?? group.closedAt ?? group.firstInteractionDate;
    return Math.max(0, Math.round((endDate.getTime() - group.firstInteractionDate.getTime()) / 60000));
  });
  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    avgMinutes: Math.round(total / values.length),
    minMinutes: Math.min(...values),
    maxMinutes: Math.max(...values)
  };
}

export function mapWinLoss(summary: AnalyticsSummaryDto): WinLossDto {
  return {
    wins: summary.winRate.wins,
    losses: summary.winRate.losses,
    neutral: summary.winRate.neutral,
    winRate: summary.winRate.percentage,
    currentLossStreak: summary.streaks.currentLossStreak,
    longestLossStreak: summary.streaks.longestLossStreak
  };
}
