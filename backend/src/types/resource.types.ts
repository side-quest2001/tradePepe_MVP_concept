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
  totalRows: number;
  importedRows: number;
  failedRows: number;
  createdAt: Date;
}

export interface ImportHistoryFilters {
  page: number;
  pageSize: number;
  fundId?: string;
}

export interface ResourceRepository {
  listTags(filters: TagFilters): Promise<TradeTag[]>;
  createTag(input: Partial<TradeTag> & Pick<TradeTag, "name" | "slug" | "scope">): Promise<TradeTag>;
  updateTag(id: string, input: Partial<TradeTag>): Promise<TradeTag | null>;
  findTagById(id: string): Promise<TradeTag | null>;
  findTagBySlugAndScope(slug: string, scope: "setup" | "review"): Promise<TradeTag | null>;
  listFunds(): Promise<Fund[]>;
  createFund(input: Pick<Fund, "name" | "code" | "baseCurrency"> & Partial<Fund>): Promise<Fund>;
  updateFund(id: string, input: Partial<Fund>): Promise<Fund | null>;
  findFundById(id: string): Promise<Fund | null>;
  listImports(filters: ImportHistoryFilters): Promise<PaginatedResult<Import>>;
  getImportById(id: string): Promise<Import | null>;
  listNotesByOrderGroupId(orderGroupId: string): Promise<TradeNote[]>;
  findNoteById(id: string): Promise<TradeNote | null>;
  updateNote(id: string, input: Partial<TradeNote>): Promise<TradeNote | null>;
  deleteNote(id: string): Promise<void>;
}
