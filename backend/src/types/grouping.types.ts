import type { OrderGroup, OrderGroupOrder, RawOrder, NewOrderGroup, NewOrderGroupOrder } from "../db/schema/trading.schema.js";

export interface GroupingOrderInput
  extends Pick<
    RawOrder,
    | "id"
    | "fundId"
    | "symbol"
    | "side"
    | "executedQuantity"
    | "tradedPrice"
    | "executionTime"
    | "orderTime"
    | "normalizedStatus"
  > {}

export interface TradeGroupingRepository {
  findOpenGroupByFundAndSymbol(fundId: string, symbol: string): Promise<OrderGroup | null>;
  createOrderGroup(input: NewOrderGroup): Promise<OrderGroup>;
  updateOrderGroup(id: string, input: Partial<NewOrderGroup>): Promise<OrderGroup>;
  getNextSequenceNumber(orderGroupId: string): Promise<number>;
  linkOrderToGroup(input: NewOrderGroupOrder): Promise<OrderGroupOrder>;
}

export interface GroupingResult {
  groupId: string;
  status: "open" | "closed";
  remainingQuantity: string;
  realizedPnl: string | null;
  returnStatus: "profit" | "loss" | "neutral";
}
