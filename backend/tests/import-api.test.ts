import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const importServiceMock = {
  importBrokerCsv: vi.fn()
};

vi.mock("../src/services/import.service.js", () => ({
  importService: importServiceMock
}));

vi.mock("../src/middlewares/auth.middleware.js", () => ({
  requireAuth: (req: { authUser?: unknown }, _res: unknown, next: () => void) => {
    req.authUser = {
      id: "11111111-1111-4111-8111-111111111111",
      email: "pepe@tradepepe.dev",
      name: "Siddha PePe",
      handle: "@siddhapepe"
    };
    next();
  }
}));

const { createApp } = await import("../src/app.js");

describe("Import API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/v1/imports/csv uploads a CSV and returns summary", async () => {
    importServiceMock.importBrokerCsv.mockResolvedValue({
      importId: "import-1",
      totalRows: 2,
      importedRows: 2,
      failedRows: 0,
      errors: []
    });

    const csv = `Symbol,Buy/Sell,Type,Product Type,Qty,Rem Qty,Limit Price,Stop Price,Traded Price,Status,Order Time
RELIANCE,BUY,MARKET,CNC,10,0,,,2450.50,FILLED,2026-04-05T09:15:00Z`;

    const response = await request(createApp())
      .post("/api/v1/imports/csv")
      .field("fundId", "11111111-1111-4111-8111-111111111111")
      .field("brokerName", "Zerodha")
      .attach("file", Buffer.from(csv), {
        filename: "orders.csv",
        contentType: "text/csv"
      });

    expect(response.status).toBe(201);
    expect(response.body.data.importId).toBe("import-1");
    expect(importServiceMock.importBrokerCsv).toHaveBeenCalledTimes(1);
  });
});
