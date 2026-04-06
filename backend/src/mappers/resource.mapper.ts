import type { Fund, Import, SharedTradeGroup, TradeNote, TradeTag } from "../db/schema/trading.schema.js";
import type { FundDto, ImportHistoryDto, TagDto } from "../types/resource.types.js";

export function mapTag(tag: TradeTag): TagDto {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    color: tag.color ?? null,
    type: tag.scope === "both" ? "setup" : tag.scope,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  };
}

export function mapFund(fund: Fund): FundDto {
  return {
    id: fund.id,
    name: fund.name,
    brokerName: fund.brokerName ?? null,
    currency: fund.baseCurrency,
    createdAt: fund.createdAt
  };
}

export function mapImportHistory(item: Import): ImportHistoryDto {
  return {
    importId: item.id,
    fundId: item.fundId,
    brokerName: item.brokerName ?? null,
    fileName: item.fileName ?? null,
    totalRows: item.totalRows,
    importedRows: item.importedRows,
    failedRows: item.failedRows,
    createdAt: item.createdAt
  };
}

export function mapTradeNote(note: TradeNote) {
  return {
    id: note.id,
    orderGroupId: note.orderGroupId,
    noteType: note.noteType,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

export function mapPublishedTrade(publishedTrade: SharedTradeGroup | null) {
  if (!publishedTrade) {
    return null;
  }

  return {
    id: publishedTrade.id,
    orderGroupId: publishedTrade.orderGroupId,
    publicId: publishedTrade.publicId,
    status: publishedTrade.status,
    title: publishedTrade.title ?? null,
    summary: publishedTrade.summary ?? null,
    publishedAt: publishedTrade.publishedAt,
    snapshot: publishedTrade.snapshot ?? null,
    createdAt: publishedTrade.createdAt,
    updatedAt: publishedTrade.updatedAt
  };
}
