import { and, eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { funds, imports, rawOrders } from "../db/schema/trading.schema.js";
import { OrderGroupRepository } from "./order-group.repository.js";
import { TradeGroupingService } from "../services/trade-grouping.service.js";
import { ApiError } from "../utils/api-error.js";

import type { FailImportInput, FinalizeImportInput, CreateImportRecordInput, ImportPersistence } from "../types/import.types.js";

class ImportRepository implements ImportPersistence {
  async ensureFundOwnedByUser(fundId: string, ownerUserId: string) {
    const rows = await db
      .select({ id: funds.id })
      .from(funds)
      .where(and(eq(funds.id, fundId), eq(funds.ownerUserId, ownerUserId)))
      .limit(1);

    return rows[0] ?? null;
  }

  async createImportRecord(input: CreateImportRecordInput) {
    try {
      const results = await db
        .insert(imports)
        .values({
          fundId: input.fundId,
          source: "csv_upload",
          status: "processing",
          brokerName: input.brokerName ?? null,
          fileName: input.fileName ?? null,
          fileChecksum: input.fileChecksum ?? null,
          startedAt: new Date(),
          metadata: input.metadata ?? null
        })
        .returning({
          id: imports.id,
          status: imports.status
        });

      return results[0];
    } catch (error) {
      const maybeDbError = error as { code?: string; constraint?: string; constraint_name?: string };
      const constraint = maybeDbError.constraint_name ?? maybeDbError.constraint;
      if (maybeDbError.code === "23505" && constraint === "imports_fund_checksum_unique_idx") {
        throw new ApiError(409, "This CSV has already been imported for the selected fund");
      }
      throw error;
    }
  }

  async finalizeImport(input: FinalizeImportInput) {
    await db.transaction(async (tx) => {
      const groupingRepository = new OrderGroupRepository(tx);
      const groupingService = new TradeGroupingService(groupingRepository);

      if (input.rawOrders.length > 0) {
        const insertedRawOrders = await tx.insert(rawOrders).values(input.rawOrders).returning();

        for (const rawOrder of insertedRawOrders) {
          await groupingService.processOrder(rawOrder);
        }
      }

      await tx
        .update(imports)
        .set({
          status: "completed",
          totalRows: input.totalRows,
          importedRows: input.importedRows,
          failedRows: input.failedRows,
          skippedRows: 0,
          completedAt: new Date(),
          metadata: input.metadata ?? null,
          updatedAt: new Date()
        })
        .where(eq(imports.id, input.importId));
    });
  }

  async failImport(input: FailImportInput) {
    await db
      .update(imports)
      .set({
        status: "failed",
        totalRows: input.totalRows,
        failedRows: input.failedRows,
        completedAt: new Date(),
        metadata: input.metadata ?? null,
        updatedAt: new Date()
      })
      .where(eq(imports.id, input.importId));
  }
}

export const importRepository = new ImportRepository();
