import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  orderGroupReviewTags,
  orderGroupSetupTags,
  orderGroups,
  tradeTags
} from "../db/schema/trading.schema.js";

import type {
  AnalyticsFilters,
  AnalyticsRepository,
  AnalyticsTagCount,
  AnalyticsTagInsight,
  DailyPerformanceRow
} from "../types/analytics.types.js";
import type { DbExecutor } from "../types/db.types.js";

function buildGroupFilters(filters: AnalyticsFilters) {
  const predicates = [eq(orderGroups.status, "closed")];

  if (filters.fundId) {
    predicates.push(eq(orderGroups.fundId, filters.fundId));
  }

  if (filters.symbol) {
    predicates.push(eq(orderGroups.symbol, filters.symbol.toUpperCase()));
  }

  if (filters.dateFrom) {
    predicates.push(gte(orderGroups.firstInteractionDate, filters.dateFrom));
  }

  if (filters.dateTo) {
    predicates.push(lte(sql`coalesce(${orderGroups.lastInteractionDate}, ${orderGroups.firstInteractionDate})`, filters.dateTo));
  }

  return and(...predicates);
}

function buildOpenGroupFilters(filters: AnalyticsFilters) {
  const predicates = [eq(orderGroups.status, "open")];

  if (filters.fundId) {
    predicates.push(eq(orderGroups.fundId, filters.fundId));
  }

  if (filters.symbol) {
    predicates.push(eq(orderGroups.symbol, filters.symbol.toUpperCase()));
  }

  if (filters.dateFrom) {
    predicates.push(gte(orderGroups.firstInteractionDate, filters.dateFrom));
  }

  if (filters.dateTo) {
    predicates.push(lte(orderGroups.firstInteractionDate, filters.dateTo));
  }

  return and(...predicates);
}

export class AnalyticsRepositoryImpl implements AnalyticsRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async listClosedOrderGroups(filters: AnalyticsFilters) {
    return this.executor
      .select()
      .from(orderGroups)
      .where(buildGroupFilters(filters))
      .orderBy(desc(orderGroups.lastInteractionDate), desc(orderGroups.firstInteractionDate));
  }

  async listOpenOrderGroups(filters: AnalyticsFilters) {
    return this.executor
      .select()
      .from(orderGroups)
      .where(buildOpenGroupFilters(filters))
      .orderBy(desc(orderGroups.firstInteractionDate));
  }

  async getSetupTagCounts(filters: AnalyticsFilters): Promise<AnalyticsTagCount[]> {
    return this.executor
      .select({
        tagId: tradeTags.id,
        slug: tradeTags.slug,
        name: tradeTags.name,
        count: count()
      })
      .from(orderGroupSetupTags)
      .innerJoin(tradeTags, eq(tradeTags.id, orderGroupSetupTags.tradeTagId))
      .innerJoin(orderGroups, eq(orderGroups.id, orderGroupSetupTags.orderGroupId))
      .where(buildGroupFilters(filters))
      .groupBy(tradeTags.id, tradeTags.slug, tradeTags.name)
      .orderBy(desc(count()));
  }

  async getReviewTagCounts(filters: AnalyticsFilters): Promise<AnalyticsTagCount[]> {
    return this.executor
      .select({
        tagId: tradeTags.id,
        slug: tradeTags.slug,
        name: tradeTags.name,
        count: count()
      })
      .from(orderGroupReviewTags)
      .innerJoin(tradeTags, eq(tradeTags.id, orderGroupReviewTags.tradeTagId))
      .innerJoin(orderGroups, eq(orderGroups.id, orderGroupReviewTags.orderGroupId))
      .where(buildGroupFilters(filters))
      .groupBy(tradeTags.id, tradeTags.slug, tradeTags.name)
      .orderBy(desc(count()));
  }

  async getSetupTagInsights(filters: AnalyticsFilters): Promise<AnalyticsTagInsight[]> {
    return this.executor
      .select({
        tagId: tradeTags.id,
        slug: tradeTags.slug,
        name: tradeTags.name,
        count: count(),
        wins: sql<number>`sum(case when ${orderGroups.returnStatus} = 'profit' then 1 else 0 end)::int`,
        losses: sql<number>`sum(case when ${orderGroups.returnStatus} = 'loss' then 1 else 0 end)::int`,
        neutral: sql<number>`sum(case when ${orderGroups.returnStatus} = 'neutral' then 1 else 0 end)::int`
      })
      .from(orderGroupSetupTags)
      .innerJoin(tradeTags, eq(tradeTags.id, orderGroupSetupTags.tradeTagId))
      .innerJoin(orderGroups, eq(orderGroups.id, orderGroupSetupTags.orderGroupId))
      .where(buildGroupFilters(filters))
      .groupBy(tradeTags.id, tradeTags.slug, tradeTags.name)
      .orderBy(desc(count()));
  }

  async getReviewTagInsights(filters: AnalyticsFilters): Promise<AnalyticsTagInsight[]> {
    return this.executor
      .select({
        tagId: tradeTags.id,
        slug: tradeTags.slug,
        name: tradeTags.name,
        count: count(),
        wins: sql<number>`sum(case when ${orderGroups.returnStatus} = 'profit' then 1 else 0 end)::int`,
        losses: sql<number>`sum(case when ${orderGroups.returnStatus} = 'loss' then 1 else 0 end)::int`,
        neutral: sql<number>`sum(case when ${orderGroups.returnStatus} = 'neutral' then 1 else 0 end)::int`
      })
      .from(orderGroupReviewTags)
      .innerJoin(tradeTags, eq(tradeTags.id, orderGroupReviewTags.tradeTagId))
      .innerJoin(orderGroups, eq(orderGroups.id, orderGroupReviewTags.orderGroupId))
      .where(buildGroupFilters(filters))
      .groupBy(tradeTags.id, tradeTags.slug, tradeTags.name)
      .orderBy(desc(count()));
  }

  async getDailyPerformanceRows(filters: AnalyticsFilters): Promise<DailyPerformanceRow[]> {
    const rows = await this.executor
      .select({
        date: sql<string>`date_trunc('day', coalesce(${orderGroups.lastInteractionDate}, ${orderGroups.firstInteractionDate}))::date::text`,
        pnl: sql<string>`coalesce(sum(${orderGroups.realizedPnl}), 0)::text`,
        tradeCount: count(),
        wins: sql<number>`sum(case when ${orderGroups.returnStatus} = 'profit' then 1 else 0 end)::int`,
        losses: sql<number>`sum(case when ${orderGroups.returnStatus} = 'loss' then 1 else 0 end)::int`,
        neutral: sql<number>`sum(case when ${orderGroups.returnStatus} = 'neutral' then 1 else 0 end)::int`
      })
      .from(orderGroups)
      .where(buildGroupFilters(filters))
      .groupBy(sql`date_trunc('day', coalesce(${orderGroups.lastInteractionDate}, ${orderGroups.firstInteractionDate}))`)
      .orderBy(sql`date_trunc('day', coalesce(${orderGroups.lastInteractionDate}, ${orderGroups.firstInteractionDate}))`);

    return rows;
  }
}

export const analyticsRepository = new AnalyticsRepositoryImpl();
