import { and, asc, count, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  funds,
  orderGroupOrders,
  orderGroupReviewTags,
  orderGroupSetupTags,
  orderGroups,
  rawOrders,
  sharedTradeGroups,
  tradeNotes,
  tradeTags
} from "../db/schema/trading.schema.js";
import { OrderGroupRepository } from "./order-group.repository.js";
import { TradeGroupingService } from "../services/trade-grouping.service.js";
import { ApiError } from "../utils/api-error.js";
import type { DbExecutor } from "../types/db.types.js";
import type { JournalRepository, OrderFilters, OrderGroupBundle, OrderGroupFilters, PaginatedResult } from "../types/journal.types.js";
import type {
  NewOrderGroupReviewTag,
  NewOrderGroupSetupTag,
  NewRawOrder,
  NewSharedTradeGroup,
  NewTradeNote,
  OrderGroup,
  RawOrder,
  TradeNote
} from "../db/schema/trading.schema.js";

function buildPagination<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1
  };
}

export class JournalRepositoryImpl implements JournalRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async createManualOrderWithGrouping(input: NewRawOrder, ownerUserId: string) {
    return this.executor.transaction(async (tx) => {
      const fundRows = await tx
        .select({ id: funds.id })
        .from(funds)
        .where(and(eq(funds.id, input.fundId), eq(funds.ownerUserId, ownerUserId)))
        .limit(1);

      if (!fundRows[0]) {
        throw new ApiError(404, "Fund not found");
      }

      const insertedOrders = await tx.insert(rawOrders).values(input).returning();
      const order = insertedOrders[0];
      const groupingService = new TradeGroupingService(new OrderGroupRepository(tx));
      const groupingResult = await groupingService.processOrder(order);
      const scopedRepository = new JournalRepositoryImpl(tx);
      const orderGroup = groupingResult
        ? await scopedRepository.getOrderGroupBundle(groupingResult.groupId, ownerUserId)
        : null;

      return {
        order,
        orderGroup
      };
    });
  }

  async listOrders(filters: OrderFilters) {
    const predicates = [];

    if (filters.ownerUserId) predicates.push(eq(funds.ownerUserId, filters.ownerUserId));
    if (filters.symbol) predicates.push(eq(rawOrders.symbol, filters.symbol.toUpperCase()));
    if (filters.fundId) predicates.push(eq(rawOrders.fundId, filters.fundId));
    if (filters.status) predicates.push(eq(rawOrders.normalizedStatus, filters.status));
    if (filters.dateFrom) predicates.push(gte(rawOrders.orderTime, filters.dateFrom));
    if (filters.dateTo) predicates.push(lte(rawOrders.orderTime, filters.dateTo));

    const whereClause = predicates.length > 0 ? and(...predicates) : undefined;
    const [totalResult] = await this.executor
      .select({ count: count() })
      .from(rawOrders)
      .innerJoin(funds, eq(funds.id, rawOrders.fundId))
      .where(whereClause);

    const orderByColumn = filters.sortBy === "orderTime" ? rawOrders.orderTime : rawOrders.executionTime;
    const items = await this.executor
      .select()
      .from(rawOrders)
      .innerJoin(funds, eq(funds.id, rawOrders.fundId))
      .where(whereClause)
      .orderBy(filters.sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn), desc(rawOrders.createdAt))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize);

    return buildPagination(
      items.map((item) => item.raw_orders),
      totalResult?.count ?? 0,
      filters.page,
      filters.pageSize
    );
  }

  async listOrderGroups(filters: OrderGroupFilters) {
    const predicates = [];

    if (filters.ownerUserId) predicates.push(eq(funds.ownerUserId, filters.ownerUserId));
    if (filters.symbol) predicates.push(eq(orderGroups.symbol, filters.symbol.toUpperCase()));
    if (filters.fundId) predicates.push(eq(orderGroups.fundId, filters.fundId));
    if (filters.positionType) predicates.push(eq(orderGroups.positionType, filters.positionType));
    if (filters.status) predicates.push(eq(orderGroups.status, filters.status));
    if (filters.returnStatus) predicates.push(eq(orderGroups.returnStatus, filters.returnStatus));
    if (filters.dateFrom) predicates.push(gte(orderGroups.firstInteractionDate, filters.dateFrom));
    if (filters.dateTo) predicates.push(lte(orderGroups.firstInteractionDate, filters.dateTo));

    if (filters.setupTag) {
      predicates.push(
        sql`exists (
          select 1
          from ${orderGroupSetupTags}
          inner join ${tradeTags} on ${tradeTags.id} = ${orderGroupSetupTags.tradeTagId}
          where ${orderGroupSetupTags.orderGroupId} = ${orderGroups.id}
            and ${tradeTags.slug} = ${filters.setupTag}
        )`
      );
    }

    if (filters.reviewTag) {
      predicates.push(
        sql`exists (
          select 1
          from ${orderGroupReviewTags}
          inner join ${tradeTags} on ${tradeTags.id} = ${orderGroupReviewTags.tradeTagId}
          where ${orderGroupReviewTags.orderGroupId} = ${orderGroups.id}
            and ${tradeTags.slug} = ${filters.reviewTag}
        )`
      );
    }

    const whereClause = predicates.length > 0 ? and(...predicates) : undefined;
    const [totalResult] = await this.executor
      .select({ count: count() })
      .from(orderGroups)
      .innerJoin(funds, eq(funds.id, orderGroups.fundId))
      .where(whereClause);

    const sortColumn =
      filters.sortBy === "firstInteractionDate" ? orderGroups.firstInteractionDate : orderGroups.lastInteractionDate;

    const groups = await this.executor
      .select()
      .from(orderGroups)
      .innerJoin(funds, eq(funds.id, orderGroups.fundId))
      .where(whereClause)
      .orderBy(filters.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn), desc(orderGroups.createdAt))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize);

    return buildPagination(
      groups.map((item) => item.order_groups),
      totalResult?.count ?? 0,
      filters.page,
      filters.pageSize
    );
  }

  async getOrderGroupBundle(id: string, ownerUserId?: string): Promise<OrderGroupBundle | null> {
    const results = await this.getOrderGroupBundles([id], ownerUserId);
    return results[0] ?? null;
  }

  async getOrderGroupBundles(ids: string[], ownerUserId?: string): Promise<OrderGroupBundle[]> {
    if (ids.length === 0) {
      return [];
    }

    const groups = await this.executor
      .select()
      .from(orderGroups)
      .innerJoin(funds, eq(funds.id, orderGroups.fundId))
      .where(
        ownerUserId
          ? and(inArray(orderGroups.id, ids), eq(funds.ownerUserId, ownerUserId))
          : inArray(orderGroups.id, ids)
      );

    const scopedGroups = groups.map((item) => item.order_groups);

    if (scopedGroups.length === 0) {
      return [];
    }

    const orders = await this.executor
      .select({
        orderGroupId: orderGroupOrders.orderGroupId,
        id: rawOrders.id,
        fundId: rawOrders.fundId,
        importId: rawOrders.importId,
        source: rawOrders.source,
        brokerName: rawOrders.brokerName,
        brokerOrderId: rawOrders.brokerOrderId,
        brokerExecutionId: rawOrders.brokerExecutionId,
        importRowNumber: rawOrders.importRowNumber,
        symbol: rawOrders.symbol,
        side: rawOrders.side,
        orderTypeRaw: rawOrders.orderTypeRaw,
        productTypeRaw: rawOrders.productTypeRaw,
        quantity: rawOrders.quantity,
        remainingQuantity: rawOrders.remainingQuantity,
        executedQuantity: rawOrders.executedQuantity,
        limitPrice: rawOrders.limitPrice,
        stopPrice: rawOrders.stopPrice,
        tradedPrice: rawOrders.tradedPrice,
        statusRaw: rawOrders.statusRaw,
        normalizedStatus: rawOrders.normalizedStatus,
        orderTime: rawOrders.orderTime,
        executionTime: rawOrders.executionTime,
        rawPayload: rawOrders.rawPayload,
        notes: rawOrders.notes,
        createdAt: rawOrders.createdAt,
        updatedAt: rawOrders.updatedAt,
        role: orderGroupOrders.role,
        sequenceNumber: orderGroupOrders.sequenceNumber,
        signedQuantityDelta: orderGroupOrders.signedQuantityDelta
      })
      .from(orderGroupOrders)
      .innerJoin(rawOrders, eq(rawOrders.id, orderGroupOrders.rawOrderId))
      .where(inArray(orderGroupOrders.orderGroupId, scopedGroups.map((group) => group.id)))
      .orderBy(asc(orderGroupOrders.sequenceNumber));

    const setupTags = await this.executor
      .select({
        orderGroupId: orderGroupSetupTags.orderGroupId,
        id: tradeTags.id,
        name: tradeTags.name,
        slug: tradeTags.slug,
        scope: tradeTags.scope,
        color: tradeTags.color,
        description: tradeTags.description,
        createdAt: tradeTags.createdAt,
        updatedAt: tradeTags.updatedAt
      })
      .from(orderGroupSetupTags)
      .innerJoin(tradeTags, eq(tradeTags.id, orderGroupSetupTags.tradeTagId))
      .where(inArray(orderGroupSetupTags.orderGroupId, scopedGroups.map((group) => group.id)));

    const reviewTags = await this.executor
      .select({
        orderGroupId: orderGroupReviewTags.orderGroupId,
        id: tradeTags.id,
        name: tradeTags.name,
        slug: tradeTags.slug,
        scope: tradeTags.scope,
        color: tradeTags.color,
        description: tradeTags.description,
        createdAt: tradeTags.createdAt,
        updatedAt: tradeTags.updatedAt
      })
      .from(orderGroupReviewTags)
      .innerJoin(tradeTags, eq(tradeTags.id, orderGroupReviewTags.tradeTagId))
      .where(inArray(orderGroupReviewTags.orderGroupId, scopedGroups.map((group) => group.id)));

    const notes = await this.executor
      .select()
      .from(tradeNotes)
      .where(inArray(tradeNotes.orderGroupId, scopedGroups.map((group) => group.id)))
      .orderBy(desc(tradeNotes.createdAt));

    const publishedTrades = await this.executor
      .select()
      .from(sharedTradeGroups)
      .where(inArray(sharedTradeGroups.orderGroupId, scopedGroups.map((group) => group.id)));

    const groupedOrdersMap = new Map<string, OrderGroupBundle["orders"]>();
    for (const order of orders) {
      const { orderGroupId, ...rawOrder } = order;
      const existing = groupedOrdersMap.get(orderGroupId) ?? [];
      existing.push(rawOrder);
      groupedOrdersMap.set(orderGroupId, existing);
    }

    const groupedSetupTags = new Map<string, OrderGroupBundle["setupTags"]>();
    for (const tag of setupTags) {
      const { orderGroupId, ...tradeTag } = tag;
      const existing = groupedSetupTags.get(orderGroupId) ?? [];
      existing.push(tradeTag);
      groupedSetupTags.set(orderGroupId, existing);
    }

    const groupedReviewTags = new Map<string, OrderGroupBundle["reviewTags"]>();
    for (const tag of reviewTags) {
      const { orderGroupId, ...tradeTag } = tag;
      const existing = groupedReviewTags.get(orderGroupId) ?? [];
      existing.push(tradeTag);
      groupedReviewTags.set(orderGroupId, existing);
    }

    const groupedNotes = new Map<string, OrderGroupBundle["notes"]>();
    for (const note of notes) {
      const existing = groupedNotes.get(note.orderGroupId) ?? [];
      existing.push(note);
      groupedNotes.set(note.orderGroupId, existing);
    }

    const publishedTradeByGroupId = new Map(publishedTrades.map((trade) => [trade.orderGroupId, trade]));

    return scopedGroups.map((group) => ({
      group,
      orders: groupedOrdersMap.get(group.id) ?? [],
      setupTags: groupedSetupTags.get(group.id) ?? [],
      reviewTags: groupedReviewTags.get(group.id) ?? [],
      notes: groupedNotes.get(group.id) ?? [],
      publishedTrade: publishedTradeByGroupId.get(group.id) ?? null
    }));
  }

  async updateOrderGroup(id: string, input: Partial<OrderGroup>) {
    const results = await this.executor
      .update(orderGroups)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(orderGroups.id, id))
      .returning();

    return results[0] ?? null;
  }

  async createTradeNote(input: NewTradeNote) {
    const results = await this.executor.insert(tradeNotes).values(input).returning();
    return results[0];
  }

  async listTradeNotes(orderGroupId: string) {
    return this.executor
      .select()
      .from(tradeNotes)
      .where(eq(tradeNotes.orderGroupId, orderGroupId))
      .orderBy(desc(tradeNotes.createdAt));
  }

  async getTradeNoteById(id: string) {
    const results = await this.executor.select().from(tradeNotes).where(eq(tradeNotes.id, id)).limit(1);
    return results[0] ?? null;
  }

  async updateTradeNote(id: string, input: Partial<TradeNote>) {
    const results = await this.executor
      .update(tradeNotes)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(tradeNotes.id, id))
      .returning();

    return results[0] ?? null;
  }

  async deleteTradeNote(id: string) {
    await this.executor.delete(tradeNotes).where(eq(tradeNotes.id, id));
  }

  async resolveTradeTag(input: { tagId?: string; tagSlug?: string }) {
    const predicates = [];
    if (input.tagId) predicates.push(eq(tradeTags.id, input.tagId));
    if (input.tagSlug) predicates.push(eq(tradeTags.slug, input.tagSlug));
    if (predicates.length === 0) return null;

    const results = await this.executor
      .select()
      .from(tradeTags)
      .where(or(...predicates))
      .limit(1);

    return results[0] ?? null;
  }

  async addSetupTag(input: NewOrderGroupSetupTag) {
    await this.executor.insert(orderGroupSetupTags).values(input).onConflictDoNothing();
  }

  async addReviewTag(input: NewOrderGroupReviewTag) {
    await this.executor.insert(orderGroupReviewTags).values(input).onConflictDoNothing();
  }

  async getPublishedTradeGroupByOrderGroupId(orderGroupId: string) {
    const results = await this.executor
      .select()
      .from(sharedTradeGroups)
      .where(eq(sharedTradeGroups.orderGroupId, orderGroupId))
      .limit(1);

    return results[0] ?? null;
  }

  async publishTradeGroup(input: NewSharedTradeGroup) {
    const existing = await this.getPublishedTradeGroupByOrderGroupId(input.orderGroupId);

    if (existing) {
      const results = await this.executor
        .update(sharedTradeGroups)
        .set({
          publicId: input.publicId ?? existing.publicId,
          status: input.status ?? existing.status,
          title: input.title ?? existing.title,
          summary: input.summary ?? existing.summary,
          publishedAt: input.publishedAt ?? existing.publishedAt,
          snapshot: input.snapshot ?? existing.snapshot,
          updatedAt: new Date()
        })
        .where(eq(sharedTradeGroups.orderGroupId, input.orderGroupId))
        .returning();

      return results[0];
    }

    const results = await this.executor.insert(sharedTradeGroups).values(input).returning();
    return results[0];
  }
}

export const journalRepository = new JournalRepositoryImpl();
