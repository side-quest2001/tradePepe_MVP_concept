import { describe, expect, it, vi } from "vitest";

import { ImportService } from "../src/services/import.service.js";
import { ApiError } from "../src/utils/api-error.js";

import type { ImportPersistence } from "../src/types/import.types.js";

const validFundId = "11111111-1111-4111-8111-111111111111";

const validCsv = `Symbol,Buy/Sell,Type,Product Type,Qty,Rem Qty,Limit Price,Stop Price,Traded Price,Status,Order Time
RELIANCE,BUY,MARKET,CNC,10,0,,,2450.50,FILLED,2026-04-05T09:15:00Z
INFY,SELL,LIMIT,MIS,5,2,1500.00,,1498.25,PARTIALLY FILLED,2026-04-05T10:30:00Z`;

const standardCsv = `Symbol,Buy/Sell,Type,Product Type,Qty,Rem Qty,Limit Price,Stop Price,Traded Price,Status,Order Time
NSE:NIFTY2612025700PE,Sell,Limit,MARGIN,65,0,161,,161.1,Filled,19 Jan 2026 13:47:33
NSE:NIFTY2612025700PE,Buy,Limit,MARGIN,130,0,195,,193.75,Filled,19 Jan 2026 12:27:00`;

function createPersistenceMock(): ImportPersistence {
  return {
    ensureFundOwnedByUser: vi.fn().mockResolvedValue({ id: validFundId }),
    createImportRecord: vi.fn().mockResolvedValue({ id: "import-1", status: "processing" }),
    finalizeImport: vi.fn().mockResolvedValue(undefined),
    failImport: vi.fn().mockResolvedValue(undefined)
  };
}

describe("ImportService", () => {
  it("imports a valid broker CSV file", async () => {
    const persistence = createPersistenceMock();
    const service = new ImportService(persistence);

    const result = await service.importBrokerCsv({
      csvContent: validCsv,
      fundId: validFundId,
      ownerUserId: "user-1",
      brokerName: "Zerodha",
      fileName: "orders.csv"
    });

    expect(result).toEqual({
      importId: "import-1",
      totalRows: 2,
      importedRows: 2,
      failedRows: 0,
      errors: []
    });

    expect(persistence.createImportRecord).toHaveBeenCalledTimes(1);
    expect(persistence.finalizeImport).toHaveBeenCalledTimes(1);
    expect(persistence.failImport).not.toHaveBeenCalled();
  });

  it("rejects a file with missing required headers", async () => {
    const persistence = createPersistenceMock();
    const service = new ImportService(persistence);
    const badHeaderCsv = `Symbol,Buy/Sell,Type,Qty,Rem Qty,Limit Price,Stop Price,Traded Price,Status,Order Time
RELIANCE,BUY,MARKET,10,0,,,2450.50,FILLED,2026-04-05T09:15:00Z`;

    await expect(
      service.importBrokerCsv({
        csvContent: badHeaderCsv,
        fundId: validFundId,
        ownerUserId: "user-1"
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "CSV headers do not match the expected broker format"
    });

    expect(persistence.failImport).toHaveBeenCalledTimes(1);
    expect(persistence.finalizeImport).not.toHaveBeenCalled();
  });

  it("accepts the standard title-case broker CSV format", async () => {
    const persistence = createPersistenceMock();
    const service = new ImportService(persistence);

    const result = await service.importBrokerCsv({
      csvContent: standardCsv,
      fundId: validFundId,
      ownerUserId: "user-1",
      brokerName: "Zerodha",
      fileName: "trading-orders-all-2026-01-19T12_45_12.090Z.csv"
    });

    expect(result).toEqual({
      importId: "import-1",
      totalRows: 2,
      importedRows: 2,
      failedRows: 0,
      errors: []
    });

    expect(persistence.finalizeImport).toHaveBeenCalledTimes(1);
    expect(persistence.failImport).not.toHaveBeenCalled();
  });

  it("reports bad number fields as row-level validation errors", async () => {
    const persistence = createPersistenceMock();
    const service = new ImportService(persistence);
    const badNumberCsv = `Symbol,Buy/Sell,Type,Product Type,Qty,Rem Qty,Limit Price,Stop Price,Traded Price,Status,Order Time
RELIANCE,BUY,MARKET,CNC,abc,0,,,2450.50,FILLED,2026-04-05T09:15:00Z`;

    const result = await service.importBrokerCsv({
      csvContent: badNumberCsv,
      fundId: validFundId,
      ownerUserId: "user-1"
    });

    expect(result.totalRows).toBe(1);
    expect(result.importedRows).toBe(0);
    expect(result.failedRows).toBe(1);
    expect(result.errors[0]).toEqual({
      rowNumber: 2,
      messages: ["Qty must be a valid decimal number"]
    });
  });

  it("reports bad date fields as row-level validation errors", async () => {
    const persistence = createPersistenceMock();
    const service = new ImportService(persistence);
    const badDateCsv = `Symbol,Buy/Sell,Type,Product Type,Qty,Rem Qty,Limit Price,Stop Price,Traded Price,Status,Order Time
RELIANCE,BUY,MARKET,CNC,10,0,,,2450.50,FILLED,not-a-date`;

    const result = await service.importBrokerCsv({
      csvContent: badDateCsv,
      fundId: validFundId,
      ownerUserId: "user-1"
    });

    expect(result.totalRows).toBe(1);
    expect(result.importedRows).toBe(0);
    expect(result.failedRows).toBe(1);
    expect(result.errors[0]).toEqual({
      rowNumber: 2,
      messages: ["Order Time must be a valid timestamp"]
    });
  });

  it("rejects an empty file", async () => {
    const persistence = createPersistenceMock();
    const service = new ImportService(persistence);

    await expect(
      service.importBrokerCsv({
        csvContent: "   ",
        fundId: validFundId,
        ownerUserId: "user-1"
      })
    ).rejects.toBeInstanceOf(ApiError);

    expect(persistence.failImport).toHaveBeenCalledTimes(1);
    expect(persistence.finalizeImport).not.toHaveBeenCalled();
  });

  it("surfaces duplicate CSV imports as a friendly conflict", async () => {
    const persistence = createPersistenceMock();
    persistence.createImportRecord = vi.fn().mockRejectedValue({
      code: "23505",
      constraint: "imports_fund_checksum_unique_idx"
    });
    const service = new ImportService(persistence);

    await expect(
      service.importBrokerCsv({
        csvContent: validCsv,
        fundId: validFundId,
        ownerUserId: "user-1",
        fileName: "orders.csv"
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "This CSV has already been imported for the selected fund"
    });
  });
});
