import { z } from "zod";

const decimalPattern = /^-?\d+(\.\d+)?$/;

function parseRequiredDecimal(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`${fieldName} is required`);
  }

  if (!decimalPattern.test(normalized)) {
    throw new Error(`${fieldName} must be a valid decimal number`);
  }

  return normalized;
}

function parseOptionalDecimal(value: string): string | null {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  if (!decimalPattern.test(normalized)) {
    throw new Error("Must be a valid decimal number");
  }

  return normalized;
}

function parseOrderTime(value: string): Date {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error("Order Time is required");
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Order Time must be a valid timestamp");
  }

  return parsed;
}

export const csvImportRequestSchema = z.object({
  fundId: z.string().uuid("fundId must be a valid UUID"),
  brokerName: z.string().trim().min(1).max(120).optional(),
  fileName: z.string().trim().min(1).max(255).optional()
});

export const brokerCsvRowSchema = z.object({
  Symbol: z.string().trim().min(1, "Symbol is required").max(40).transform((value) => value.toUpperCase()),
  "Buy/Sell": z.enum(["BUY", "SELL"]).or(z.enum(["buy", "sell"])).transform((value) => value.toLowerCase() as "buy" | "sell"),
  Type: z.string().trim().min(1, "Type is required").max(60),
  "Product Type": z.string().trim().min(1, "Product Type is required").max(60),
  Qty: z.string().transform((value) => parseRequiredDecimal(value, "Qty")),
  "Rem Qty": z.string().transform((value) => parseRequiredDecimal(value, "Rem Qty")),
  "Limit Price": z.string().transform((value) => parseOptionalDecimal(value)),
  "Stop Price": z.string().transform((value) => parseOptionalDecimal(value)),
  "Traded Price": z.string().transform((value) => parseOptionalDecimal(value)),
  Status: z.string().trim().min(1, "Status is required").max(80),
  "Order Time": z.string().transform(parseOrderTime)
});

export type CsvImportRequest = z.infer<typeof csvImportRequestSchema>;
export type BrokerCsvRow = z.infer<typeof brokerCsvRowSchema>;
