import type { OrderGroup } from "../db/schema/trading.schema.js";

export interface AnalyticsFilters {
  ownerUserId?: string;
  fundId?: string;
  symbol?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AnalyticsTagCount {
  tagId: string;
  slug: string;
  name: string;
  count: number;
}

export interface AnalyticsTagInsight extends AnalyticsTagCount {
  wins: number;
  losses: number;
  neutral: number;
}

export interface DailyPerformanceRow {
  date: string;
  pnl: string;
  wins: number;
  losses: number;
  neutral: number;
  tradeCount: number;
}

export interface AnalyticsRepository {
  listClosedOrderGroups(filters: AnalyticsFilters): Promise<OrderGroup[]>;
  listOpenOrderGroups(filters: AnalyticsFilters): Promise<OrderGroup[]>;
  getSetupTagCounts(filters: AnalyticsFilters): Promise<AnalyticsTagCount[]>;
  getReviewTagCounts(filters: AnalyticsFilters): Promise<AnalyticsTagCount[]>;
  getSetupTagInsights(filters: AnalyticsFilters): Promise<AnalyticsTagInsight[]>;
  getReviewTagInsights(filters: AnalyticsFilters): Promise<AnalyticsTagInsight[]>;
  getDailyPerformanceRows(filters: AnalyticsFilters): Promise<DailyPerformanceRow[]>;
}

export interface AnalyticsSummaryDto {
  pnlSummary: {
    realizedPnl: string;
    unrealizedPnl: null;
    closedTradeCount: number;
    openTradeCount: number;
  };
  winRate: {
    percentage: number;
    wins: number;
    losses: number;
    neutral: number;
  };
  averageHoldingTime: {
    milliseconds: number;
    hours: number;
  };
  extremes: {
    maxLossPerTrade: string | null;
    highestProfit: string | null;
  };
  streaks: {
    currentLossStreak: number;
    longestLossStreak: number;
  };
  tags: {
    mostTradedSetup: AnalyticsTagCount | null;
    mostCommonReview: AnalyticsTagCount | null;
  };
  dailyPerformanceCalendar: DailyPerformanceRow[];
}

export interface SummaryApiDto {
  totalRealizedPnl: string;
  totalClosedTrades: number;
  winRate: number;
  avgHoldingTimeMinutes: number;
  maxLoss: string | null;
  maxProfit: string | null;
}

export interface PerformanceCalendarDto {
  date: string;
  pnl: string;
  tradeCount: number;
  wins: number;
  losses: number;
  neutral: number;
}

export interface PnlSeriesPointDto {
  date: string;
  pnl: string;
  cumulativePnl: string;
  tradeCount: number;
}

export interface HoldingTimeDto {
  avgMinutes: number;
  minMinutes: number | null;
  maxMinutes: number | null;
}

export interface WinLossDto {
  wins: number;
  losses: number;
  neutral: number;
  winRate: number;
  currentLossStreak: number;
  longestLossStreak: number;
}

export interface TagInsightsDto {
  setup: AnalyticsTagInsight[];
  review: AnalyticsTagInsight[];
}
