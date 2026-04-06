import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

const colorSchema = z
  .string()
  .trim()
  .regex(/^#?[0-9a-fA-F]{3,8}$/, "Expected a valid hex color")
  .transform((value) => (value.startsWith("#") ? value : `#${value}`));

const tagTypeSchema = z.enum(["setup", "review"]);

export const tagListQuerySchema = z.object({
  type: tagTypeSchema.optional()
});

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional(),
  color: colorSchema.nullish(),
  type: tagTypeSchema
});

export const patchTagSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    slug: z.string().trim().min(1).max(80).optional(),
    color: colorSchema.nullish(),
    type: tagTypeSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

export const createFundSchema = z.object({
  name: z.string().trim().min(1).max(120),
  brokerName: z.string().trim().min(1).max(120).optional(),
  currency: z.string().trim().min(1).max(10).default("INR")
});

export const patchFundSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    brokerName: z.string().trim().min(1).max(120).nullable().optional(),
    currency: z.string().trim().min(1).max(10).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

export const importsListQuerySchema = paginationSchema.extend({
  fundId: z.string().uuid().optional()
});

export const idParamSchema = z.object({
  id: z.string().uuid()
});

export const patchNoteSchema = z
  .object({
    noteType: z.enum(["general", "setup", "review"]).optional(),
    content: z.string().trim().min(1).max(5000).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

const dateRangeSchema = z
  .object({
    fundId: z.string().uuid().optional(),
    symbol: z.string().trim().min(1).max(40).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional()
  })
  .refine((value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo, {
    message: "dateFrom must be before or equal to dateTo",
    path: ["dateFrom"]
  });

export const analyticsQuerySchema = dateRangeSchema;

export const patchPublishSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    summary: z.string().trim().min(1).max(5000).optional(),
    status: z.enum(["draft", "published", "archived"]).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

export type TagListQuery = z.infer<typeof tagListQuerySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type PatchTagInput = z.infer<typeof patchTagSchema>;
export type CreateFundInput = z.infer<typeof createFundSchema>;
export type PatchFundInput = z.infer<typeof patchFundSchema>;
export type ImportsListQuery = z.infer<typeof importsListQuerySchema>;
export type PatchNoteInput = z.infer<typeof patchNoteSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type PatchPublishInput = z.infer<typeof patchPublishSchema>;
