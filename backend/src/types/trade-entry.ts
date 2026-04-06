export type TradeSide = "long" | "short";

export interface TradeEntryCreateInput {
  symbol: string;
  side: TradeSide;
  entryPrice: string;
  exitPrice?: string | null;
  quantity: string;
  openedAt: Date;
  closedAt?: Date | null;
  notes?: string | null;
  ownerId?: string | null;
}
