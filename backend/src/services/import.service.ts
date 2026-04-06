import { createHash } from "node:crypto";

import type { NewRawOrder } from "../db/schema/trading.schema.js";
import { importRepository } from "../repositories/import.repository.js";
import type {
  CsvImportSummary,
  ImportPersistence,
  ParsedBrokerCsvRow,
  RowValidationIssue
} from "../types/import.types.js";
import { ApiError } from "../utils/api-error.js";
import { parseBrokerCsv } from "../utils/broker-csv.util.js";
import { compareDecimalStrings } from "../utils/pnl.util.js";
import { brokerCsvRowSchema, csvImportRequestSchema } from "../validators/import.validator.js";

import type { CsvImportRequest } from "../validators/import.validator.js";

function normalizeOrderStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("partial")) {
    return "partially_filled" as const;
  }

  if (normalized.includes("fill") || normalized === "complete" || normalized === "executed") {
    return "filled" as const;
  }

  if (normalized.includes("cancel")) {
    return "cancelled" as const;
  }

  if (normalized.includes("reject")) {
    return "rejected" as const;
  }

  if (normalized.includes("expire")) {
    return "expired" as const;
  }

  if (normalized.includes("open")) {
    return "open" as const;
  }

  if (normalized.includes("pending")) {
    return "pending" as const;
  }

  return "unknown" as const;
}

function createRowError(rowNumber: number, messages: string[]): RowValidationIssue {
  return {
    rowNumber,
    messages
  };
}

function validateBrokerRow(row: ParsedBrokerCsvRow) {
  try {
    const parsed = brokerCsvRowSchema.safeParse(row.values);

    if (!parsed.success) {
      return {
        success: false as const,
        error: createRowError(
          row.rowNumber,
          parsed.error.issues.map((issue) => issue.message)
        )
      };
    }

    return {
      success: true as const,
      data: parsed.data
    };
  } catch (error) {
    return {
      success: false as const,
      error: createRowError(row.rowNumber, [error instanceof Error ? error.message : "Invalid row data"])
    };
  }
}

function mapRowToRawOrder(row: ParsedBrokerCsvRow, request: CsvImportRequest, importId: string): NewRawOrder {
  const parsedRow = brokerCsvRowSchema.parse(row.values);
  const normalizedStatus = normalizeOrderStatus(parsedRow.Status);
  const quantity = parsedRow.Qty;
  const remainingQuantity = parsedRow["Rem Qty"];
  const executedQuantity = (Number(quantity) - Number(remainingQuantity)).toFixed(8);
  const executionTime = normalizedStatus === "filled" || normalizedStatus === "partially_filled" ? parsedRow["Order Time"] : null;

  return {
    fundId: request.fundId,
    importId,
    source: "csv_import",
    brokerName: request.brokerName ?? null,
    importRowNumber: row.rowNumber,
    symbol: parsedRow.Symbol,
    side: parsedRow["Buy/Sell"],
    orderTypeRaw: parsedRow.Type,
    productTypeRaw: parsedRow["Product Type"],
    quantity,
    remainingQuantity,
    executedQuantity,
    limitPrice: parsedRow["Limit Price"],
    stopPrice: parsedRow["Stop Price"],
    tradedPrice: parsedRow["Traded Price"],
    statusRaw: parsedRow.Status,
    normalizedStatus,
    orderTime: parsedRow["Order Time"],
    executionTime,
    rawPayload: row.values
  };
}

export class ImportService {
  constructor(private readonly persistence: ImportPersistence = importRepository) {}

  async importBrokerCsv(input: { csvContent: string; fundId: string; brokerName?: string; fileName?: string }): Promise<CsvImportSummary> {
    const request = csvImportRequestSchema.parse({
      fundId: input.fundId,
      brokerName: input.brokerName,
      fileName: input.fileName
    });

    const importRecord = await this.persistence.createImportRecord({
      fundId: request.fundId,
      brokerName: request.brokerName,
      fileName: request.fileName,
      fileChecksum: createHash("sha256").update(input.csvContent).digest("hex")
    });

    try {
      const parsedRows = await parseBrokerCsv(input.csvContent);
      const validRawOrders: NewRawOrder[] = [];
      const errors: RowValidationIssue[] = [];

      for (const row of parsedRows) {
        const parsedRow = validateBrokerRow(row);

        if (!parsedRow.success) {
          errors.push(parsedRow.error);
          continue;
        }

        if (compareDecimalStrings(parsedRow.data["Rem Qty"], parsedRow.data.Qty) > 0) {
          errors.push(createRowError(row.rowNumber, ["Rem Qty cannot be greater than Qty"]));
          continue;
        }

        validRawOrders.push(mapRowToRawOrder(row, request, importRecord.id));
      }

      await this.persistence.finalizeImport({
        importId: importRecord.id,
        rawOrders: validRawOrders,
        totalRows: parsedRows.length,
        importedRows: validRawOrders.length,
        failedRows: errors.length,
        metadata: errors.length > 0 ? { rowErrors: errors } : null
      });

      return {
        importId: importRecord.id,
        totalRows: parsedRows.length,
        importedRows: validRawOrders.length,
        failedRows: errors.length,
        errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown import failure";
      const details = error instanceof ApiError ? error.details ?? null : null;
      await this.persistence.failImport({
        importId: importRecord.id,
        totalRows: 0,
        failedRows: 0,
        metadata: {
          error: message,
          details
        }
      });

      throw error;
    }
  }
}

export const importService = new ImportService();
