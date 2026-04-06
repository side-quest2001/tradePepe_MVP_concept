import { beforeEach, describe, expect, it, vi } from "vitest";

import { MarketService } from "../src/services/market.service.js";

describe("MarketService", () => {
  const repository = {
    listFlashNews: vi.fn(),
    listEconomicIndicators: vi.fn()
  };

  const flashNewsProvider = {
    getFlashNews: vi.fn()
  };

  const economicIndicatorsProvider = {
    getEconomicIndicators: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses provider data for flash news when available", async () => {
    flashNewsProvider.getFlashNews.mockResolvedValue([
      {
        id: "provider-news",
        title: "Provider headline",
        summary: "Provider summary",
        source: "MarketAux",
        createdAt: "2026-04-06T10:00:00.000Z"
      }
    ]);
    repository.listFlashNews.mockResolvedValue([]);

    const service = new MarketService(
      repository as never,
      flashNewsProvider,
      economicIndicatorsProvider,
      () => 0
    );

    const result = await service.listFlashNews();

    expect(result[0].id).toBe("provider-news");
    expect(repository.listFlashNews).not.toHaveBeenCalled();
  });

  it("falls back to repository flash news when provider fails", async () => {
    flashNewsProvider.getFlashNews.mockRejectedValue(new Error("provider down"));
    repository.listFlashNews.mockResolvedValue([
      {
        id: "fallback-news",
        title: "Fallback headline",
        summary: "Fallback summary",
        source: "Seed",
        createdAt: new Date("2026-04-06T10:00:00.000Z")
      }
    ]);

    const service = new MarketService(
      repository as never,
      flashNewsProvider,
      economicIndicatorsProvider,
      () => 0
    );

    const result = await service.listFlashNews();

    expect(result[0].id).toBe("fallback-news");
    expect(repository.listFlashNews).toHaveBeenCalledTimes(1);
  });

  it("falls back to repository economic indicators when provider is unavailable", async () => {
    economicIndicatorsProvider.getEconomicIndicators.mockResolvedValue(null);
    repository.listEconomicIndicators.mockResolvedValue([
      {
        id: "eco-1",
        country: "India",
        indicator: "Manufacturing PMI",
        september: "58.1",
        october: "57.8",
        november: "56.9",
        december: "56.7",
        sortOrder: 1,
        createdAt: new Date("2026-04-06T10:00:00.000Z"),
        updatedAt: new Date("2026-04-06T10:00:00.000Z")
      }
    ]);

    const service = new MarketService(
      repository as never,
      flashNewsProvider,
      economicIndicatorsProvider,
      () => 0
    );

    const result = await service.listEconomicIndicators();

    expect(result[0].country).toBe("India");
    expect(repository.listEconomicIndicators).toHaveBeenCalledTimes(1);
  });
});
