import { ApiError } from "./api-error.js";
import {
  addDecimalStrings,
  compareDecimalStrings,
  decimalToScaledInteger,
  divideDecimalStrings,
  isZeroDecimal,
  multiplyDecimalStrings,
  scaledIntegerToDecimal
} from "./pnl.util.js";

import type { OrderGroup, RawOrder } from "../db/schema/trading.schema.js";

export function getExecutionTimestamp(order: Pick<RawOrder, "executionTime" | "orderTime">): Date {
  return order.executionTime ?? order.orderTime;
}

export function getExecutableQuantity(order: Pick<RawOrder, "executedQuantity">): string {
  if (compareDecimalStrings(order.executedQuantity, "0") <= 0) {
    throw new ApiError(409, "Order executed quantity must be greater than zero for grouping");
  }

  return order.executedQuantity;
}

export function getOrderTradePrice(order: Pick<RawOrder, "tradedPrice">): string {
  if (!order.tradedPrice) {
    throw new ApiError(409, "Order traded price is required for grouping");
  }

  return order.tradedPrice;
}

export function resolvePositionType(side: RawOrder["side"]): "long" | "short" {
  return side === "buy" ? "long" : "short";
}

export function calculateSignedQuantityDelta(positionType: OrderGroup["positionType"], side: RawOrder["side"], quantity: string): string {
  const isPositive =
    (positionType === "long" && side === "buy") || (positionType === "short" && side === "sell");

  return isPositive ? quantity : scaledIntegerToDecimal(decimalToScaledInteger(quantity) * -1n);
}

export function determineGroupOrderRole(
  signedQuantityDelta: string,
  currentRemainingQuantity: string,
  nextRemainingQuantity: string
): "open" | "scale_in" | "scale_out" | "close" {
  if (isZeroDecimal(currentRemainingQuantity)) {
    return "open";
  }

  if (compareDecimalStrings(nextRemainingQuantity, "0") === 0) {
    return "close";
  }

  return compareDecimalStrings(signedQuantityDelta, "0") > 0 ? "scale_in" : "scale_out";
}

export function calculateNextRemainingQuantity(currentRemainingQuantity: string, signedQuantityDelta: string): string {
  const nextRemainingQuantity = addDecimalStrings(currentRemainingQuantity, signedQuantityDelta);

  if (compareDecimalStrings(nextRemainingQuantity, "0") < 0) {
    throw new ApiError(409, "Order would over-close the existing position group");
  }

  return nextRemainingQuantity;
}

export function calculateWeightedAveragePrice(
  currentAveragePrice: string | null,
  currentQuantity: string,
  additionalPrice: string,
  additionalQuantity: string
): string {
  if (isZeroDecimal(currentQuantity) || !currentAveragePrice) {
    return additionalPrice;
  }

  const currentNotional = multiplyDecimalStrings(currentAveragePrice, currentQuantity);
  const additionalNotional = multiplyDecimalStrings(additionalPrice, additionalQuantity);
  const totalNotional = addDecimalStrings(currentNotional, additionalNotional);
  const totalQuantity = addDecimalStrings(currentQuantity, additionalQuantity);

  return divideDecimalStrings(totalNotional, totalQuantity);
}

export function calculateRealizedPnl(input: {
  positionType: OrderGroup["positionType"];
  averageEntryPrice: string;
  averageExitPrice: string;
  closedQuantity: string;
  charges?: string | null;
  brokerFees?: string | null;
}): string {
  const grossDifference =
    input.positionType === "long"
      ? decimalToScaledInteger(input.averageExitPrice) - decimalToScaledInteger(input.averageEntryPrice)
      : decimalToScaledInteger(input.averageEntryPrice) - decimalToScaledInteger(input.averageExitPrice);

  const grossPnl =
    (grossDifference * decimalToScaledInteger(input.closedQuantity)) / decimalToScaledInteger("1.00000000");
  const charges = decimalToScaledInteger(input.charges ?? "0.00000000");
  const brokerFees = decimalToScaledInteger(input.brokerFees ?? "0.00000000");

  return scaledIntegerToDecimal(grossPnl - charges - brokerFees);
}

export function determineReturnStatus(realizedPnl: string): "profit" | "loss" | "neutral" {
  const comparison = compareDecimalStrings(realizedPnl, "0");

  if (comparison > 0) {
    return "profit";
  }

  if (comparison < 0) {
    return "loss";
  }

  return "neutral";
}
