import { z } from "zod";

const decimalString = z.string().regex(/^-?\d+(\.\d+)?$/, "Expected a decimal string");

const positiveDecimalString = z.string().regex(/^\d+(\.\d+)?$/, "Expected a positive decimal string");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

const dateRangeSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
}).refine((value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo, {
  message: "dateFrom must be before or equal to dateTo",
  path: ["dateFrom"]
});

export const orderListQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    symbol: z.string().trim().min(1).max(40).optional(),
    fundId: z.string().uuid().optional(),
    status: z.enum(["pending", "open", "partially_filled", "filled", "cancelled", "rejected", "expired", "unknown"]).optional(),
    sortBy: z.enum(["orderTime", "executionTime"]).default("executionTime"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  });

export const orderGroupListQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    symbol: z.string().trim().min(1).max(40).optional(),
    fundId: z.string().uuid().optional(),
    positionType: z.enum(["long", "short"]).optional(),
    status: z.enum(["open", "closed"]).optional(),
    returnStatus: z.enum(["profit", "loss", "neutral"]).optional(),
    setupTag: z.string().trim().min(1).max(80).optional(),
    reviewTag: z.string().trim().min(1).max(80).optional(),
    sortBy: z.enum(["firstInteractionDate", "lastInteractionDate"]).default("firstInteractionDate"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  });

export const orderGroupIdParamSchema = z.object({
  id: z.string().uuid()
});

export const manualOrderSchema = z.object({
  fundId: z.string().uuid(),
  symbol: z.string().trim().min(1).max(40).transform((value) => value.toUpperCase()),
  side: z.enum(["buy", "sell"]),
  orderType: z.string().trim().min(1).max(60),
  productType: z.string().trim().min(1).max(60),
  qty: positiveDecimalString,
  limitPrice: decimalString.nullish(),
  stopPrice: decimalString.nullish(),
  tradedPrice: positiveDecimalString,
  status: z.enum(["pending", "open", "partially_filled", "filled", "cancelled", "rejected", "expired", "unknown"]),
  executedAt: z.coerce.date(),
  brokerName: z.string().trim().min(1).max(120).optional(),
  notes: z.string().trim().max(2000).optional()
});

export const patchOrderGroupSchema = z
  .object({
    notes: z.string().trim().max(2000).nullable().optional(),
    brokerFees: decimalString.optional(),
    charges: decimalString.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

export const createTradeNoteSchema = z.object({
  noteType: z.enum(["general", "setup", "review"]).default("general"),
  content: z.string().trim().min(1).max(5000)
});

export const assignTradeTagSchema = z
  .object({
    tagId: z.string().uuid().optional(),
    tagSlug: z.string().trim().min(1).max(80).optional()
  })
  .refine((value) => value.tagId || value.tagSlug, {
    message: "Provide tagId or tagSlug"
  });

export const publishTradeGroupSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  summary: z.string().trim().min(1).max(5000).optional()
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type OrderGroupListQuery = z.infer<typeof orderGroupListQuerySchema>;
export type ManualOrderInput = z.infer<typeof manualOrderSchema>;
export type PatchOrderGroupInput = z.infer<typeof patchOrderGroupSchema>;
export type CreateTradeNoteInput = z.infer<typeof createTradeNoteSchema>;
export type AssignTradeTagInput = z.infer<typeof assignTradeTagSchema>;
export type PublishTradeGroupInput = z.infer<typeof publishTradeGroupSchema>;
