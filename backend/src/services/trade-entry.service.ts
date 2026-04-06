import type { NewTradeEntry } from "../db/schema/trade-entry.schema.js";
import { tradeEntryRepository } from "../repositories/trade-entry.repository.js";
import { parseCsv } from "../utils/csv.util.js";
import {
  csvTradeRowSchema,
  tradeEntryCsvTextSchema,
  tradeEntrySchema,
  type TradeEntryPayload
} from "../validators/trade-entry.validator.js";

class TradeEntryService {
  async list() {
    return tradeEntryRepository.list();
  }

  async create(payload: TradeEntryPayload) {
    const validatedPayload = tradeEntrySchema.parse(payload);

    return tradeEntryRepository.create({
      ...validatedPayload,
      exitPrice: validatedPayload.exitPrice ?? null,
      closedAt: validatedPayload.closedAt ?? null,
      notes: validatedPayload.notes ?? null,
      ownerId: validatedPayload.ownerId ?? null
    });
  }

  async importFromCsv(content: string) {
    const validatedCsv = tradeEntryCsvTextSchema.parse(content);
    const rows = await parseCsv<Record<string, string>>(validatedCsv);

    const parsedRows: NewTradeEntry[] = rows.map((row) => {
      const parsedRow = csvTradeRowSchema.parse(row);

      return {
        symbol: parsedRow.symbol.toUpperCase(),
        side: parsedRow.side,
        entryPrice: parsedRow.entryPrice,
        exitPrice: parsedRow.exitPrice || null,
        quantity: parsedRow.quantity,
        openedAt: new Date(parsedRow.openedAt),
        closedAt: parsedRow.closedAt ? new Date(parsedRow.closedAt) : null,
        notes: parsedRow.notes?.trim() || null
      };
    });

    return tradeEntryRepository.bulkCreate(parsedRows);
  }
}

export const tradeEntryService = new TradeEntryService();
