import type {
  Import,
  NewOrderGroupReviewTag,
  NewOrderGroupSetupTag,
  NewRawOrder,
  NewSharedTradeGroup,
  NewTradeNote,
  OrderGroup,
  RawOrder,
  SharedTradeGroup,
  TradeNote,
  TradeTag
} from "../db/schema/trading.schema.js";

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface OrderGroupFilters {
  symbol?: string;
  fundId?: string;
  positionType?: "long" | "short";
  status?: "open" | "closed";
  returnStatus?: "profit" | "loss" | "neutral";
  dateFrom?: Date;
  dateTo?: Date;
  setupTag?: string;
  reviewTag?: string;
  sortBy: "firstInteractionDate" | "lastInteractionDate";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface OrderFilters {
  symbol?: string;
  fundId?: string;
  status?: RawOrder["normalizedStatus"];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: "orderTime" | "executionTime";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface OrderGroupBundle {
  group: OrderGroup;
  orders: Array<RawOrder & { role: "open" | "scale_in" | "scale_out" | "close"; sequenceNumber: number; signedQuantityDelta: string }>;
  setupTags: TradeTag[];
  reviewTags: TradeTag[];
  notes: TradeNote[];
  publishedTrade: SharedTradeGroup | null;
}

export interface JournalRepository {
  createManualOrderWithGrouping(input: NewRawOrder): Promise<{ order: RawOrder; orderGroup: OrderGroupBundle | null }>;
  listOrders(filters: OrderFilters): Promise<PaginatedResult<RawOrder>>;
  listOrderGroups(filters: OrderGroupFilters): Promise<PaginatedResult<OrderGroup>>;
  getOrderGroupBundle(id: string): Promise<OrderGroupBundle | null>;
  getOrderGroupBundles(ids: string[]): Promise<OrderGroupBundle[]>;
  updateOrderGroup(id: string, input: Partial<OrderGroup>): Promise<OrderGroup | null>;
  createTradeNote(input: NewTradeNote): Promise<TradeNote>;
  listTradeNotes(orderGroupId: string): Promise<TradeNote[]>;
  getTradeNoteById(id: string): Promise<TradeNote | null>;
  updateTradeNote(id: string, input: Partial<TradeNote>): Promise<TradeNote | null>;
  deleteTradeNote(id: string): Promise<void>;
  resolveTradeTag(input: { tagId?: string; tagSlug?: string }): Promise<TradeTag | null>;
  addSetupTag(input: NewOrderGroupSetupTag): Promise<void>;
  addReviewTag(input: NewOrderGroupReviewTag): Promise<void>;
  publishTradeGroup(input: NewSharedTradeGroup): Promise<SharedTradeGroup>;
  getPublishedTradeGroupByOrderGroupId(orderGroupId: string): Promise<SharedTradeGroup | null>;
}

export interface OrderDto {
  id: string;
  symbol: string;
  fundId: string;
  side: "buy" | "sell";
  source: "csv_import" | "broker_sync" | "manual";
  quantity: string;
  executedQuantity: string;
  remainingQuantity: string;
  tradedPrice: string | null;
  normalizedStatus: string;
  orderTime: Date;
  executionTime: Date | null;
  createdAt: Date;
}

export interface UiOrderGroupOrderDto {
  id: string;
  side: "buy" | "sell";
  role: "open" | "scale_in" | "scale_out" | "close";
  quantity: string;
  executedQuantity: string;
  tradedPrice: string | null;
  executionTime: Date | null;
  orderTime: Date;
  sequenceNumber: number;
}

export interface UiOrderGroupDto {
  id: string;
  symbol: string;
  fundId: string;
  positionType: "long" | "short";
  firstInteractionDate: Date;
  lastInteractionDate: Date | null;
  remainingQuantity: string;
  realizedPnl: string | null;
  unrealizedPnl: null;
  returnStatus: "profit" | "loss" | "neutral" | null;
  status: "open" | "closed";
  entryOrders: UiOrderGroupOrderDto[];
  exitOrders: UiOrderGroupOrderDto[];
  setupTags: Array<{ id: string; name: string; slug: string; color: string | null }>;
  reviewTags: Array<{ id: string; name: string; slug: string; color: string | null }>;
  notesSummary: {
    count: number;
    latest: string | null;
  };
  publishedTrade: {
    id: string;
    publicId: string;
    status: "draft" | "published" | "archived";
    publishedAt: Date | null;
  } | null;
}

export interface ManualOrderCreateResponseDto {
  order: OrderDto;
  orderGroup: UiOrderGroupDto | null;
}

export interface OrderGroupChartPointDto {
  sequence: number;
  timestamp: Date;
  pnl: string;
}

export interface OrderGroupChartMarkerDto {
  orderId: string;
  sequence: number;
  side: "buy" | "sell";
  role: "open" | "scale_in" | "scale_out" | "close";
  price: string | null;
  quantity: string;
  executedQuantity: string;
  timestamp: Date | null;
}

export interface OrderGroupChartDto {
  orderMarkers: OrderGroupChartMarkerDto[];
  pnlSeries: OrderGroupChartPointDto[];
  summary: {
    entryAvg: string | null;
    exitAvg: string | null;
    remainingQuantity: string;
  };
}
