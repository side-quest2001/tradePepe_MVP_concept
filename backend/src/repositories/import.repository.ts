import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { imports, rawOrders } from "../db/schema/trading.schema.js";
import { OrderGroupRepository } from "./order-group.repository.js";
import { TradeGroupingService } from "../services/trade-grouping.service.js";

import type { FailImportInput, FinalizeImportInput, CreateImportRecordInput, ImportPersistence } from "../types/import.types.js";

class ImportRepository implements ImportPersistence {
  async createImportRecord(input: CreateImportRecordInput) {
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
