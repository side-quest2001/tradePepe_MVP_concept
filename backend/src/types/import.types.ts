import type { NewImport, NewRawOrder } from "../db/schema/trading.schema.js";

export interface RowValidationIssue {
  rowNumber: number;
  messages: string[];
}

export interface CsvImportSummary {
  importId: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: RowValidationIssue[];
}

export interface CreateImportRecordInput {
  fundId: string;
  brokerName?: string | null;
  fileName?: string | null;
  fileChecksum?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface FinalizeImportInput {
  importId: string;
  rawOrders: NewRawOrder[];
  totalRows: number;
  importedRows: number;
  failedRows: number;
  metadata?: Record<string, unknown> | null;
}

export interface FailImportInput {
  importId: string;
  totalRows: number;
  failedRows: number;
  metadata?: Record<string, unknown> | null;
}

export interface ImportPersistence {
  ensureFundOwnedByUser(fundId: string, ownerUserId: string): Promise<{ id: string } | null>;
  createImportRecord(input: CreateImportRecordInput): Promise<{ id: string } & Pick<NewImport, "status">>;
  finalizeImport(input: FinalizeImportInput): Promise<void>;
  failImport(input: FailImportInput): Promise<void>;
}

export interface ParsedBrokerCsvRow {
  rowNumber: number;
  values: Record<string, string>;
}
