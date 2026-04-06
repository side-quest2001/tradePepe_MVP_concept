import request from "supertest";
import { describe, expect, it, vi } from "vitest";

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

import { createApp } from "../src/app.js";

describe("POST /api/v1/imports/csv", () => {
  it("rejects non-csv uploads with a structured error response", async () => {
    const response = await request(createApp())
      .post("/api/v1/imports/csv")
      .field("fundId", "11111111-1111-4111-8111-111111111111")
      .attach("file", Buffer.from("not,csv"), {
        filename: "orders.txt",
        contentType: "text/plain"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Only CSV uploads are allowed");
    expect(typeof response.body.error.requestId).toBe("string");
  });
});
