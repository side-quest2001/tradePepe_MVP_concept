import { randomUUID } from "node:crypto";

import { journalRepository } from "../repositories/journal.repository.js";
import { ApiError } from "../utils/api-error.js";
import {
  mapManualOrderCreateResponse,
  mapOrderGroupBundle,
  mapPaginatedOrderGroups,
  mapPaginatedOrders
} from "../mappers/journal.mapper.js";
import { calculateRealizedPnl } from "../utils/trade-grouping.util.js";
import {
  decimalToScaledInteger,
  scaledIntegerToDecimal
} from "../utils/pnl.util.js";

import type {
  AssignTradeTagInput,
  CreateTradeNoteInput,
  ManualOrderInput,
  OrderGroupListQuery,
  OrderListQuery,
  PatchOrderGroupInput,
  PublishTradeGroupInput
} from "../validators/journal.validator.js";
import type { JournalRepository } from "../types/journal.types.js";
import type { OrderGroupChartDto } from "../types/journal.types.js";
import type { PatchNoteInput, PatchPublishInput } from "../validators/resource.validator.js";

export class JournalService {
  constructor(private readonly repository: JournalRepository = journalRepository) {}

  async createManualOrder(input: ManualOrderInput) {
    const result = await this.repository.createManualOrderWithGrouping({
      fundId: input.fundId,
      importId: null,
      source: "manual",
      brokerName: input.brokerName ?? null,
      brokerOrderId: null,
      brokerExecutionId: null,
      importRowNumber: null,
      symbol: input.symbol,
      side: input.side,
      orderTypeRaw: input.orderType,
      productTypeRaw: input.productType,
      quantity: input.qty,
      remainingQuantity: "0",
      executedQuantity: input.qty,
      limitPrice: input.limitPrice ?? null,
      stopPrice: input.stopPrice ?? null,
      tradedPrice: input.tradedPrice,
      statusRaw: input.status,
      normalizedStatus: input.status,
      orderTime: input.executedAt,
      executionTime: input.executedAt,
      rawPayload: {
        source: "manual",
        orderType: input.orderType,
        productType: input.productType,
        qty: input.qty,
        status: input.status,
        executedAt: input.executedAt.toISOString(),
        notes: input.notes ?? null
      },
      notes: input.notes ?? null
    });

    return mapManualOrderCreateResponse(result);
  }

  async listOrders(query: OrderListQuery) {
    const result = await this.repository.listOrders(query);
    return mapPaginatedOrders(result);
  }

  async listOrderGroups(query: OrderGroupListQuery) {
    const groupsPage = await this.repository.listOrderGroups(query);
    const items = await this.repository.getOrderGroupBundles(groupsPage.items.map((group) => group.id));

    return mapPaginatedOrderGroups({
      ...groupsPage,
      items
    });
  }

  async getOrderGroupById(id: string) {
    const bundle = await this.repository.getOrderGroupBundle(id);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    return mapOrderGroupBundle(bundle);
  }

  async updateOrderGroup(id: string, input: PatchOrderGroupInput) {
    const updatedGroup = await this.repository.updateOrderGroup(id, input);

    if (!updatedGroup) {
      throw new ApiError(404, "Order group not found");
    }

    return this.getOrderGroupById(updatedGroup.id);
  }

  async createTradeNote(orderGroupId: string, input: CreateTradeNoteInput) {
    const bundle = await this.repository.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    const note = await this.repository.createTradeNote({
      orderGroupId,
      noteType: input.noteType,
      content: input.content,
      createdByUserId: null
    });

    return note;
  }

  async listTradeNotes(orderGroupId: string) {
    const bundle = await this.repository.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    return this.repository.listTradeNotes(orderGroupId);
  }

  async updateTradeNote(noteId: string, input: PatchNoteInput) {
    const note = await this.repository.getTradeNoteById(noteId);

    if (!note) {
      throw new ApiError(404, "Note not found");
    }

    return this.repository.updateTradeNote(noteId, input);
  }

  async deleteTradeNote(noteId: string) {
    const note = await this.repository.getTradeNoteById(noteId);

    if (!note) {
      throw new ApiError(404, "Note not found");
    }

    await this.repository.deleteTradeNote(noteId);
    return {
      id: noteId,
      deleted: true
    };
  }

  async assignSetupTag(orderGroupId: string, input: AssignTradeTagInput) {
    return this.assignTag(orderGroupId, input, "setup");
  }

  async assignReviewTag(orderGroupId: string, input: AssignTradeTagInput) {
    return this.assignTag(orderGroupId, input, "review");
  }

  async publishTradeGroup(orderGroupId: string, input: PublishTradeGroupInput, createdByUserId?: string | null) {
    const bundle = await this.repository.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    const sharedTrade = await this.repository.publishTradeGroup({
      orderGroupId,
      createdByUserId: createdByUserId ?? null,
      publicId: randomUUID(),
      status: "published",
      title: input.title ?? `${bundle.group.symbol} ${bundle.group.positionType.toUpperCase()} trade`,
      summary: input.summary ?? null,
      publishedAt: new Date(),
      snapshot: {
        group: bundle.group,
        setupTags: bundle.setupTags,
        reviewTags: bundle.reviewTags,
        notesSummary: {
          count: bundle.notes.length
        }
      }
    });

    return sharedTrade;
  }

  async getPublishedTradeGroup(orderGroupId: string) {
    const bundle = await this.repository.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    return bundle.publishedTrade ?? null;
  }

  async updatePublishedTradeGroup(orderGroupId: string, input: PatchPublishInput, createdByUserId?: string | null) {
    const bundle = await this.repository.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    const current = bundle.publishedTrade;
    const updated = await this.repository.publishTradeGroup({
      orderGroupId,
      createdByUserId: current?.createdByUserId ?? createdByUserId ?? null,
      publicId: current?.publicId ?? randomUUID(),
      status: input.status ?? current?.status ?? "draft",
      title: input.title ?? current?.title ?? `${bundle.group.symbol} trade`,
      summary: input.summary ?? current?.summary ?? null,
      publishedAt: current?.publishedAt ?? (input.status === "published" ? new Date() : null),
      snapshot: current?.snapshot ?? {
        group: bundle.group
      }
    });

    return updated;
  }

  async getOrderGroupChart(orderGroupId: string): Promise<OrderGroupChartDto> {
    const bundle = await this.repository.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    const entryAvg = bundle.group.averageEntryPrice ?? null;
    const exitAvg = bundle.group.averageExitPrice ?? null;
    let runningPnl = "0.00000000";

    const orderMarkers = bundle.orders.map((order) => ({
      orderId: order.id,
      sequence: order.sequenceNumber,
      side: order.side,
      role: order.role,
      price: order.tradedPrice,
      quantity: order.quantity,
      executedQuantity: order.executedQuantity,
      timestamp: order.executionTime ?? order.orderTime
    }));

    const pnlSeries = bundle.orders.map((order) => {
      if ((order.role === "scale_out" || order.role === "close") && order.tradedPrice && entryAvg) {
        const incrementalPnl = calculateRealizedPnl({
          positionType: bundle.group.positionType,
          averageEntryPrice: entryAvg,
          averageExitPrice: order.tradedPrice,
          closedQuantity: order.executedQuantity,
          brokerFees: "0.00000000",
          charges: "0.00000000"
        });
        runningPnl = scaledIntegerToDecimal(decimalToScaledInteger(runningPnl) + decimalToScaledInteger(incrementalPnl));
      }

      return {
        sequence: order.sequenceNumber,
        timestamp: order.executionTime ?? order.orderTime,
        pnl: runningPnl
      };
    });

    return {
      orderMarkers,
      pnlSeries,
      summary: {
        entryAvg,
        exitAvg,
        remainingQuantity: bundle.group.remainingQuantity
      }
    };
  }

  private async assignTag(orderGroupId: string, input: AssignTradeTagInput, kind: "setup" | "review") {
    const bundle = await this.repository.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    const tag = await this.repository.resolveTradeTag(input);

    if (!tag) {
      throw new ApiError(404, "Trade tag not found");
    }

    if (kind === "setup") {
      await this.repository.addSetupTag({
        orderGroupId,
        tradeTagId: tag.id
      });
    } else {
      await this.repository.addReviewTag({
        orderGroupId,
        tradeTagId: tag.id
      });
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      scope: tag.scope
    };
  }
}

export const journalService = new JournalService();
