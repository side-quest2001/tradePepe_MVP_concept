import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const fundStatusEnum = pgEnum("fund_status", ["active", "archived"]);
export const importSourceEnum = pgEnum("import_source", ["csv_upload", "broker_sync", "manual_entry"]);
export const importStatusEnum = pgEnum("import_status", ["pending", "processing", "completed", "failed"]);
export const orderEntrySourceEnum = pgEnum("order_entry_source", ["csv_import", "broker_sync", "manual"]);
export const orderSideEnum = pgEnum("order_side", ["buy", "sell"]);
export const normalizedOrderStatusEnum = pgEnum("normalized_order_status", [
  "pending",
  "open",
  "partially_filled",
  "filled",
  "cancelled",
  "rejected",
  "expired",
  "unknown"
]);
export const positionTypeEnum = pgEnum("position_type", ["long", "short"]);
export const orderGroupStatusEnum = pgEnum("order_group_status", ["open", "closed"]);
export const returnStatusEnum = pgEnum("return_status", ["profit", "loss", "neutral"]);
export const groupOrderRoleEnum = pgEnum("group_order_role", ["open", "scale_in", "scale_out", "close"]);
export const noteTypeEnum = pgEnum("trade_note_type", ["general", "setup", "review"]);
export const tagScopeEnum = pgEnum("trade_tag_scope", ["setup", "review", "both"]);
export const shareStatusEnum = pgEnum("share_status", ["draft", "published", "archived"]);

export const funds = pgTable(
  "funds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 40 }).notNull(),
    brokerName: varchar("broker_name", { length: 120 }),
    brokerAccountRef: varchar("broker_account_ref", { length: 120 }),
    baseCurrency: varchar("base_currency", { length: 10 }).notNull().default("INR"),
    status: fundStatusEnum("status").notNull().default("active"),
    isDefault: boolean("is_default").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>().default(null),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("funds_code_unique_idx").on(table.code),
    uniqueIndex("funds_broker_account_ref_unique_idx")
      .on(table.brokerAccountRef)
      .where(sql`${table.brokerAccountRef} is not null`),
    index("funds_status_idx").on(table.status)
  ]
);

export const imports = pgTable(
  "imports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fundId: uuid("fund_id")
      .notNull()
      .references(() => funds.id, { onDelete: "restrict", onUpdate: "cascade" }),
    source: importSourceEnum("source").notNull(),
    status: importStatusEnum("status").notNull().default("pending"),
    brokerName: varchar("broker_name", { length: 120 }),
    fileName: varchar("file_name", { length: 255 }),
    fileChecksum: varchar("file_checksum", { length: 128 }),
    totalRows: integer("total_rows").notNull().default(0),
    importedRows: integer("imported_rows").notNull().default(0),
    skippedRows: integer("skipped_rows").notNull().default(0),
    failedRows: integer("failed_rows").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>().default(null),
    createdAt,
    updatedAt
  },
  (table) => [
    index("imports_fund_created_at_idx").on(table.fundId, table.createdAt),
    index("imports_status_idx").on(table.status),
    uniqueIndex("imports_fund_checksum_unique_idx")
      .on(table.fundId, table.fileChecksum)
      .where(sql`${table.fileChecksum} is not null`)
  ]
);

export const rawOrders = pgTable(
  "raw_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fundId: uuid("fund_id")
      .notNull()
      .references(() => funds.id, { onDelete: "restrict", onUpdate: "cascade" }),
    importId: uuid("import_id").references(() => imports.id, { onDelete: "set null", onUpdate: "cascade" }),
    source: orderEntrySourceEnum("source").notNull(),
    brokerName: varchar("broker_name", { length: 120 }),
    brokerOrderId: varchar("broker_order_id", { length: 120 }),
    brokerExecutionId: varchar("broker_execution_id", { length: 120 }),
    importRowNumber: integer("import_row_number"),
    symbol: varchar("symbol", { length: 40 }).notNull(),
    side: orderSideEnum("side").notNull(),
    orderTypeRaw: varchar("order_type_raw", { length: 60 }),
    productTypeRaw: varchar("product_type_raw", { length: 60 }),
    quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
    remainingQuantity: numeric("remaining_quantity", { precision: 20, scale: 8 }).notNull().default("0"),
    executedQuantity: numeric("executed_quantity", { precision: 20, scale: 8 }).notNull().default("0"),
    limitPrice: numeric("limit_price", { precision: 20, scale: 8 }),
    stopPrice: numeric("stop_price", { precision: 20, scale: 8 }),
    tradedPrice: numeric("traded_price", { precision: 20, scale: 8 }),
    statusRaw: varchar("status_raw", { length: 80 }),
    normalizedStatus: normalizedOrderStatusEnum("normalized_status").notNull().default("unknown"),
    orderTime: timestamp("order_time", { withTimezone: true }).notNull(),
    executionTime: timestamp("execution_time", { withTimezone: true }),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull(),
    notes: text("notes"),
    createdAt,
    updatedAt
  },
  (table) => [
    index("raw_orders_fund_symbol_execution_time_idx").on(table.fundId, table.symbol, table.executionTime),
    index("raw_orders_fund_order_time_idx").on(table.fundId, table.orderTime),
    index("raw_orders_import_idx").on(table.importId),
    index("raw_orders_normalized_status_idx").on(table.normalizedStatus),
    uniqueIndex("raw_orders_import_row_unique_idx")
      .on(table.importId, table.importRowNumber)
      .where(sql`${table.importId} is not null and ${table.importRowNumber} is not null`),
    uniqueIndex("raw_orders_external_order_unique_idx")
      .on(table.fundId, table.source, table.brokerOrderId)
      .where(sql`${table.brokerOrderId} is not null`),
    check("raw_orders_quantity_positive_chk", sql`${table.quantity} > 0`),
    check("raw_orders_remaining_quantity_non_negative_chk", sql`${table.remainingQuantity} >= 0`),
    check("raw_orders_executed_quantity_non_negative_chk", sql`${table.executedQuantity} >= 0`)
  ]
);

export const orderGroups = pgTable(
  "order_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fundId: uuid("fund_id")
      .notNull()
      .references(() => funds.id, { onDelete: "restrict", onUpdate: "cascade" }),
    symbol: varchar("symbol", { length: 40 }).notNull(),
    positionType: positionTypeEnum("position_type").notNull(),
    status: orderGroupStatusEnum("status").notNull().default("open"),
    firstInteractionDate: timestamp("first_interaction_date", { withTimezone: true }).notNull(),
    lastInteractionDate: timestamp("last_interaction_date", { withTimezone: true }),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    openingOrderId: uuid("opening_order_id").references(() => rawOrders.id, {
      onDelete: "set null",
      onUpdate: "cascade"
    }),
    quantityOpen: numeric("quantity_open", { precision: 20, scale: 8 }).notNull(),
    quantityClosed: numeric("quantity_closed", { precision: 20, scale: 8 }).notNull().default("0"),
    remainingQuantity: numeric("remaining_quantity", { precision: 20, scale: 8 }).notNull(),
    grossBuyQuantity: numeric("gross_buy_quantity", { precision: 20, scale: 8 }).notNull().default("0"),
    grossSellQuantity: numeric("gross_sell_quantity", { precision: 20, scale: 8 }).notNull().default("0"),
    averageEntryPrice: numeric("average_entry_price", { precision: 20, scale: 8 }),
    averageExitPrice: numeric("average_exit_price", { precision: 20, scale: 8 }),
    realizedPnl: numeric("realized_pnl", { precision: 20, scale: 8 }),
    returnStatus: returnStatusEnum("return_status"),
    brokerFees: numeric("broker_fees", { precision: 20, scale: 8 }).notNull().default("0"),
    charges: numeric("charges", { precision: 20, scale: 8 }).notNull().default("0"),
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>().default(null),
    createdAt,
    updatedAt
  },
  (table) => [
    index("order_groups_fund_symbol_status_idx").on(table.fundId, table.symbol, table.status),
    index("order_groups_fund_status_first_interaction_idx").on(table.fundId, table.status, table.firstInteractionDate),
    index("order_groups_fund_closed_at_idx").on(table.fundId, table.closedAt),
    uniqueIndex("order_groups_open_symbol_fund_unique_idx")
      .on(table.fundId, table.symbol)
      .where(sql`${table.status} = 'open'`),
    check("order_groups_quantity_open_positive_chk", sql`${table.quantityOpen} > 0`),
    check("order_groups_remaining_quantity_non_negative_chk", sql`${table.remainingQuantity} >= 0`),
    check("order_groups_quantity_closed_non_negative_chk", sql`${table.quantityClosed} >= 0`)
  ]
);

export const orderGroupOrders = pgTable(
  "order_group_orders",
  {
    orderGroupId: uuid("order_group_id")
      .notNull()
      .references(() => orderGroups.id, { onDelete: "cascade", onUpdate: "cascade" }),
    rawOrderId: uuid("raw_order_id")
      .notNull()
      .references(() => rawOrders.id, { onDelete: "restrict", onUpdate: "cascade" }),
    sequenceNumber: integer("sequence_number").notNull(),
    role: groupOrderRoleEnum("role").notNull(),
    signedQuantityDelta: numeric("signed_quantity_delta", { precision: 20, scale: 8 }).notNull(),
    linkedAt: timestamp("linked_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    primaryKey({ columns: [table.orderGroupId, table.rawOrderId], name: "order_group_orders_pk" }),
    uniqueIndex("order_group_orders_raw_order_unique_idx").on(table.rawOrderId),
    uniqueIndex("order_group_orders_group_sequence_unique_idx").on(table.orderGroupId, table.sequenceNumber),
    index("order_group_orders_group_idx").on(table.orderGroupId),
    check("order_group_orders_sequence_positive_chk", sql`${table.sequenceNumber} > 0`),
    check("order_group_orders_delta_non_zero_chk", sql`${table.signedQuantityDelta} <> 0`)
  ]
);

export const tradeNotes = pgTable(
  "trade_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderGroupId: uuid("order_group_id")
      .notNull()
      .references(() => orderGroups.id, { onDelete: "cascade", onUpdate: "cascade" }),
    noteType: noteTypeEnum("note_type").notNull().default("general"),
    content: text("content").notNull(),
    createdByUserId: uuid("created_by_user_id"),
    createdAt,
    updatedAt
  },
  (table) => [
    index("trade_notes_group_created_at_idx").on(table.orderGroupId, table.createdAt),
    check("trade_notes_content_not_blank_chk", sql`char_length(trim(${table.content})) > 0`)
  ]
);

export const tradeTags = pgTable(
  "trade_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    scope: tagScopeEnum("scope").notNull().default("both"),
    color: varchar("color", { length: 20 }),
    description: text("description"),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("trade_tags_slug_unique_idx").on(table.slug),
    uniqueIndex("trade_tags_name_unique_idx").on(table.name),
    index("trade_tags_scope_idx").on(table.scope)
  ]
);

export const orderGroupSetupTags = pgTable(
  "order_group_setup_tags",
  {
    orderGroupId: uuid("order_group_id")
      .notNull()
      .references(() => orderGroups.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tradeTagId: uuid("trade_tag_id")
      .notNull()
      .references(() => tradeTags.id, { onDelete: "restrict", onUpdate: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    primaryKey({ columns: [table.orderGroupId, table.tradeTagId], name: "order_group_setup_tags_pk" }),
    index("order_group_setup_tags_tag_idx").on(table.tradeTagId)
  ]
);

export const orderGroupReviewTags = pgTable(
  "order_group_review_tags",
  {
    orderGroupId: uuid("order_group_id")
      .notNull()
      .references(() => orderGroups.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tradeTagId: uuid("trade_tag_id")
      .notNull()
      .references(() => tradeTags.id, { onDelete: "restrict", onUpdate: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    primaryKey({ columns: [table.orderGroupId, table.tradeTagId], name: "order_group_review_tags_pk" }),
    index("order_group_review_tags_tag_idx").on(table.tradeTagId)
  ]
);

export const sharedTradeGroups = pgTable(
  "shared_trade_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderGroupId: uuid("order_group_id")
      .notNull()
      .references(() => orderGroups.id, { onDelete: "cascade", onUpdate: "cascade" }),
    publicId: varchar("public_id", { length: 64 }).notNull(),
    status: shareStatusEnum("status").notNull().default("draft"),
    title: varchar("title", { length: 160 }),
    summary: text("summary"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    snapshot: jsonb("snapshot").$type<Record<string, unknown> | null>().default(null),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("shared_trade_groups_order_group_unique_idx").on(table.orderGroupId),
    uniqueIndex("shared_trade_groups_public_id_unique_idx").on(table.publicId),
    index("shared_trade_groups_status_idx").on(table.status)
  ]
);

export type Fund = typeof funds.$inferSelect;
export type NewFund = typeof funds.$inferInsert;

export type Import = typeof imports.$inferSelect;
export type NewImport = typeof imports.$inferInsert;

export type RawOrder = typeof rawOrders.$inferSelect;
export type NewRawOrder = typeof rawOrders.$inferInsert;

export type OrderGroup = typeof orderGroups.$inferSelect;
export type NewOrderGroup = typeof orderGroups.$inferInsert;

export type OrderGroupOrder = typeof orderGroupOrders.$inferSelect;
export type NewOrderGroupOrder = typeof orderGroupOrders.$inferInsert;

export type TradeNote = typeof tradeNotes.$inferSelect;
export type NewTradeNote = typeof tradeNotes.$inferInsert;

export type TradeTag = typeof tradeTags.$inferSelect;
export type NewTradeTag = typeof tradeTags.$inferInsert;

export type OrderGroupSetupTag = typeof orderGroupSetupTags.$inferSelect;
export type NewOrderGroupSetupTag = typeof orderGroupSetupTags.$inferInsert;

export type OrderGroupReviewTag = typeof orderGroupReviewTags.$inferSelect;
export type NewOrderGroupReviewTag = typeof orderGroupReviewTags.$inferInsert;

export type SharedTradeGroup = typeof sharedTradeGroups.$inferSelect;
export type NewSharedTradeGroup = typeof sharedTradeGroups.$inferInsert;
