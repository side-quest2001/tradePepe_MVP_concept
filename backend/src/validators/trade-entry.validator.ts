import { z } from "zod";

const decimalString = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Expected a positive decimal string");

export const tradeEntrySchema = z.object({
  symbol: z.string().trim().min(2).max(20).transform((value) => value.toUpperCase()),
  side: z.enum(["long", "short"]),
  entryPrice: decimalString,
  exitPrice: decimalString.nullish(),
  quantity: decimalString,
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  ownerId: z.string().uuid().nullable().optional()
});

export const csvTradeRowSchema = z.object({
  symbol: z.string().trim().min(2).max(20),
  side: z.enum(["long", "short"]),
  entryPrice: decimalString,
  exitPrice: decimalString.optional().or(z.literal("")),
  quantity: decimalString,
  openedAt: z.string().min(1),
  closedAt: z.string().optional().or(z.literal("")),
  notes: z.string().optional()
});

export const tradeEntryCsvTextSchema = z.string().trim().min(1, "CSV payload is required");

export type TradeEntryPayload = z.infer<typeof tradeEntrySchema>;
export type CsvTradeRow = z.infer<typeof csvTradeRowSchema>;
