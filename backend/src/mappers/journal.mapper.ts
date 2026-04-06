import type { ManualOrderCreateResponseDto, OrderDto, UiOrderGroupDto, UiOrderGroupOrderDto } from "../types/journal.types.js";
import type { OrderGroupBundle, PaginatedResult } from "../types/journal.types.js";
import type { RawOrder } from "../db/schema/trading.schema.js";

function mapOrderGroupOrder(order: OrderGroupBundle["orders"][number]): UiOrderGroupOrderDto {
  return {
    id: order.id,
    side: order.side,
    role: order.role,
    quantity: order.quantity,
    executedQuantity: order.executedQuantity,
    tradedPrice: order.tradedPrice,
    executionTime: order.executionTime,
    orderTime: order.orderTime,
    sequenceNumber: order.sequenceNumber
  };
}

export function mapOrder(order: RawOrder): OrderDto {
  return {
    id: order.id,
    symbol: order.symbol,
    fundId: order.fundId,
    side: order.side,
    source: order.source,
    quantity: order.quantity,
    executedQuantity: order.executedQuantity,
    remainingQuantity: order.remainingQuantity,
    tradedPrice: order.tradedPrice,
    normalizedStatus: order.normalizedStatus,
    orderTime: order.orderTime,
    executionTime: order.executionTime,
    createdAt: order.createdAt
  };
}

export function mapPaginatedOrders(result: PaginatedResult<RawOrder>): PaginatedResult<OrderDto> {
  return {
    ...result,
    items: result.items.map(mapOrder)
  };
}

export function mapOrderGroupBundle(bundle: OrderGroupBundle): UiOrderGroupDto {
  const entryOrders = bundle.orders.filter((order) => order.role === "open" || order.role === "scale_in").map(mapOrderGroupOrder);
  const exitOrders = bundle.orders.filter((order) => order.role === "scale_out" || order.role === "close").map(mapOrderGroupOrder);
  const latestNote = bundle.notes
    .slice()
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

  return {
    id: bundle.group.id,
    symbol: bundle.group.symbol,
    fundId: bundle.group.fundId,
    positionType: bundle.group.positionType,
    firstInteractionDate: bundle.group.firstInteractionDate,
    lastInteractionDate: bundle.group.lastInteractionDate,
    remainingQuantity: bundle.group.remainingQuantity,
    realizedPnl: bundle.group.realizedPnl,
    unrealizedPnl: null,
    returnStatus: bundle.group.returnStatus,
    status: bundle.group.status,
    entryOrders,
    exitOrders,
    setupTags: bundle.setupTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color ?? null
    })),
    reviewTags: bundle.reviewTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color ?? null
    })),
    notesSummary: {
      count: bundle.notes.length,
      latest: latestNote?.content ?? null
    },
    publishedTrade: bundle.publishedTrade
      ? {
          id: bundle.publishedTrade.id,
          publicId: bundle.publishedTrade.publicId,
          status: bundle.publishedTrade.status,
          publishedAt: bundle.publishedTrade.publishedAt
        }
      : null
  };
}

export function mapPaginatedOrderGroups(result: PaginatedResult<OrderGroupBundle>): PaginatedResult<UiOrderGroupDto> {
  return {
    ...result,
    items: result.items.map(mapOrderGroupBundle)
  };
}

export function mapManualOrderCreateResponse(input: {
  order: RawOrder;
  orderGroup: OrderGroupBundle | null;
}): ManualOrderCreateResponseDto {
  return {
    order: mapOrder(input.order),
    orderGroup: input.orderGroup ? mapOrderGroupBundle(input.orderGroup) : null
  };
}
