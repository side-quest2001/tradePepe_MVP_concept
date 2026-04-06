import { ApiError } from "../utils/api-error.js";
import { addDecimalStrings } from "../utils/pnl.util.js";
import {
  calculateNextRemainingQuantity,
  calculateRealizedPnl,
  calculateSignedQuantityDelta,
  calculateWeightedAveragePrice,
  determineGroupOrderRole,
  determineReturnStatus,
  getExecutableQuantity,
  getExecutionTimestamp,
  getOrderTradePrice,
  resolvePositionType
} from "../utils/trade-grouping.util.js";

import type { GroupingOrderInput, GroupingResult, TradeGroupingRepository } from "../types/grouping.types.js";
import type { NewOrderGroup, OrderGroup } from "../db/schema/trading.schema.js";

function shouldSkipGrouping(order: GroupingOrderInput): boolean {
  return Number(order.executedQuantity) <= 0;
}

function getEntryQuantity(group: OrderGroup): string {
  return group.positionType === "long" ? group.grossBuyQuantity : group.grossSellQuantity;
}

function getExitQuantity(group: OrderGroup): string {
  return group.positionType === "long" ? group.grossSellQuantity : group.grossBuyQuantity;
}

export class TradeGroupingService {
  constructor(private readonly repository: TradeGroupingRepository) {}

  async processOrder(order: GroupingOrderInput): Promise<GroupingResult | null> {
    if (shouldSkipGrouping(order)) {
      return null;
    }

    const executableQuantity = getExecutableQuantity(order);
    const tradePrice = getOrderTradePrice(order);
    const interactionDate = getExecutionTimestamp(order);
    const existingGroup = await this.repository.findOpenGroupByFundAndSymbol(order.fundId, order.symbol);

    if (!existingGroup) {
      const positionType = resolvePositionType(order.side);
      const group = await this.repository.createOrderGroup({
        fundId: order.fundId,
        symbol: order.symbol,
        positionType,
        status: "open",
        firstInteractionDate: interactionDate,
        lastInteractionDate: null,
        openedAt: interactionDate,
        closedAt: null,
        openingOrderId: order.id,
        quantityOpen: executableQuantity,
        quantityClosed: "0.00000000",
        remainingQuantity: executableQuantity,
        grossBuyQuantity: order.side === "buy" ? executableQuantity : "0.00000000",
        grossSellQuantity: order.side === "sell" ? executableQuantity : "0.00000000",
        averageEntryPrice: tradePrice,
        averageExitPrice: null,
        realizedPnl: null,
        returnStatus: "neutral",
        brokerFees: "0.00000000",
        charges: "0.00000000",
        notes: null,
        metadata: null
      });

      await this.repository.linkOrderToGroup({
        orderGroupId: group.id,
        rawOrderId: order.id,
        sequenceNumber: 1,
        role: "open",
        signedQuantityDelta: executableQuantity
      });

      return {
        groupId: group.id,
        status: "open",
        remainingQuantity: executableQuantity,
        realizedPnl: null,
        returnStatus: "neutral"
      };
    }

    const signedQuantityDelta = calculateSignedQuantityDelta(existingGroup.positionType, order.side, executableQuantity);
    const nextRemainingQuantity = calculateNextRemainingQuantity(existingGroup.remainingQuantity, signedQuantityDelta);
    const sequenceNumber = await this.repository.getNextSequenceNumber(existingGroup.id);
    const role = determineGroupOrderRole(signedQuantityDelta, existingGroup.remainingQuantity, nextRemainingQuantity);
    const nextGrossBuyQuantity =
      order.side === "buy"
        ? addDecimalStrings(existingGroup.grossBuyQuantity, executableQuantity)
        : existingGroup.grossBuyQuantity;
    const nextGrossSellQuantity =
      order.side === "sell"
        ? addDecimalStrings(existingGroup.grossSellQuantity, executableQuantity)
        : existingGroup.grossSellQuantity;

    const isEntryOrder =
      (existingGroup.positionType === "long" && order.side === "buy") ||
      (existingGroup.positionType === "short" && order.side === "sell");
    const nextAverageEntryPrice = isEntryOrder
      ? calculateWeightedAveragePrice(
          existingGroup.averageEntryPrice,
          getEntryQuantity(existingGroup),
          tradePrice,
          executableQuantity
        )
      : existingGroup.averageEntryPrice;
    const nextAverageExitPrice = !isEntryOrder
      ? calculateWeightedAveragePrice(
          existingGroup.averageExitPrice,
          getExitQuantity(existingGroup),
          tradePrice,
          executableQuantity
        )
      : existingGroup.averageExitPrice;

    if (!nextAverageEntryPrice) {
      throw new ApiError(409, "Group average entry price could not be determined");
    }

    const groupUpdate: Partial<NewOrderGroup> = {
      remainingQuantity: nextRemainingQuantity,
      grossBuyQuantity: nextGrossBuyQuantity,
      grossSellQuantity: nextGrossSellQuantity,
      quantityOpen: existingGroup.positionType === "long" ? nextGrossBuyQuantity : nextGrossSellQuantity,
      quantityClosed: existingGroup.positionType === "long" ? nextGrossSellQuantity : nextGrossBuyQuantity,
      averageEntryPrice: nextAverageEntryPrice,
      averageExitPrice: nextAverageExitPrice,
      returnStatus: "neutral"
    };

    let realizedPnl: string | null = null;
    let returnStatus: "profit" | "loss" | "neutral" = "neutral";
    let status: "open" | "closed" = "open";

    if (nextRemainingQuantity === "0.00000000") {
      if (!nextAverageExitPrice) {
        throw new ApiError(409, "Group average exit price could not be determined");
      }

      realizedPnl = calculateRealizedPnl({
        positionType: existingGroup.positionType,
        averageEntryPrice: nextAverageEntryPrice,
        averageExitPrice: nextAverageExitPrice,
        closedQuantity: existingGroup.positionType === "long" ? nextGrossSellQuantity : nextGrossBuyQuantity,
        brokerFees: existingGroup.brokerFees,
        charges: existingGroup.charges
      });
      returnStatus = determineReturnStatus(realizedPnl);
      status = "closed";

      groupUpdate.realizedPnl = realizedPnl;
      groupUpdate.returnStatus = returnStatus;
      groupUpdate.lastInteractionDate = interactionDate;
      groupUpdate.closedAt = interactionDate;
      groupUpdate.status = "closed";
    }

    await this.repository.linkOrderToGroup({
      orderGroupId: existingGroup.id,
      rawOrderId: order.id,
      sequenceNumber,
      role,
      signedQuantityDelta
    });
    await this.repository.updateOrderGroup(existingGroup.id, groupUpdate);

    return {
      groupId: existingGroup.id,
      status,
      remainingQuantity: nextRemainingQuantity,
      realizedPnl,
      returnStatus
    };
  }
}
