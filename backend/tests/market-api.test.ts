import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const marketServiceMock = {
  listFlashNews: vi.fn(),
  listEconomicIndicators: vi.fn()
};

vi.mock("../src/services/market.service.js", () => ({
  marketService: marketServiceMock
}));

const { createApp } = await import("../src/app.js");

describe("Market API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/market/flash-news returns flash news cards", async () => {
    marketServiceMock.listFlashNews.mockResolvedValue([
      {
        id: "news-1",
        title: "Broader Market News",
        summary: "Market summary",
        source: "Market Desk",
        createdAt: "2026-04-06T10:00:00.000Z"
      }
    ]);

    const response = await request(createApp()).get("/api/v1/market/flash-news");

    expect(response.status).toBe(200);
    expect(response.body.data[0].title).toBe("Broader Market News");
  });

  it("GET /api/v1/market/economic-indicators returns normalized rows", async () => {
    marketServiceMock.listEconomicIndicators.mockResolvedValue([
      {
        country: "India",
        indicator: "Manufacturing PMI",
        september: "58.1",
        october: "57.8",
        november: "Reference",
        december: "Index Points"
      }
    ]);

    const response = await request(createApp()).get("/api/v1/market/economic-indicators");

    expect(response.status).toBe(200);
    expect(response.body.data[0].indicator).toBe("Manufacturing PMI");
  });
});
