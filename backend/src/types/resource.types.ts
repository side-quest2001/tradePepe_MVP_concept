import type { Fund, Import, TradeNote, TradeTag } from "../db/schema/trading.schema.js";

import type { PaginatedResult } from "./journal.types.js";

export interface TagFilters {
  type?: "setup" | "review";
}

export interface FundDto {
  id: string;
  name: string;
  brokerName: string | null;
  currency: string;
  createdAt: Date;
}

export interface TagDto {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  type: "setup" | "review";
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportHistoryDto {
  importId: string;
  fundId: string;
  brokerName: string | null;
  fileName: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface ImportDetailDto extends ImportHistoryDto {
  metadata: Record<string, unknown> | null;
}

export interface ImportHistoryFilters {
  page: number;
  pageSize: number;
  ownerUserId?: string;
  fundId?: string;
}

export interface ResourceRepository {
  listTags(filters: TagFilters): Promise<TradeTag[]>;
  createTag(input: Partial<TradeTag> & Pick<TradeTag, "name" | "slug" | "scope">): Promise<TradeTag>;
  updateTag(id: string, input: Partial<TradeTag>): Promise<TradeTag | null>;
  findTagById(id: string): Promise<TradeTag | null>;
  findTagBySlugAndScope(slug: string, scope: "setup" | "review"): Promise<TradeTag | null>;
  listFunds(ownerUserId?: string): Promise<Fund[]>;
  createFund(input: Pick<Fund, "name" | "code" | "baseCurrency"> & Partial<Fund>): Promise<Fund>;
  updateFund(id: string, input: Partial<Fund>): Promise<Fund | null>;
  findFundById(id: string, ownerUserId?: string): Promise<Fund | null>;
  listImports(filters: ImportHistoryFilters): Promise<PaginatedResult<Import>>;
  getImportById(id: string, ownerUserId?: string): Promise<Import | null>;
  listNotesByOrderGroupId(orderGroupId: string): Promise<TradeNote[]>;
  findNoteById(id: string): Promise<TradeNote | null>;
  updateNote(id: string, input: Partial<TradeNote>): Promise<TradeNote | null>;
  deleteNote(id: string): Promise<void>;
}
