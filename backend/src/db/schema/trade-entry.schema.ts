import { pgEnum, pgTable, text, timestamp, uuid, varchar, numeric } from "drizzle-orm/pg-core";

export const tradeSideEnum = pgEnum("trade_side", ["long", "short"]);

export const tradeEntries = pgTable("trade_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id"),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  side: tradeSideEnum("side").notNull(),
  entryPrice: numeric("entry_price", { precision: 18, scale: 8 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 18, scale: 8 }),
  quantity: numeric("quantity", { precision: 18, scale: 8 }).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type TradeEntry = typeof tradeEntries.$inferSelect;
export type NewTradeEntry = typeof tradeEntries.$inferInsert;
