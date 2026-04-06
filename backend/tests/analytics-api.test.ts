import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const analyticsServiceMock = {
  getSummaryApi: vi.fn(),
  getPerformanceCalendar: vi.fn(),
  getTagInsights: vi.fn(),
  getPnlSeries: vi.fn(),
  getHoldingTime: vi.fn(),
  getWinLoss: vi.fn()
};

vi.mock("../src/services/analytics.service.js", () => ({
  analyticsService: analyticsServiceMock
}));

const { createApp } = await import("../src/app.js");

describe("Analytics API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/analytics/summary returns summary data", async () => {
    analyticsServiceMock.getSummaryApi.mockResolvedValue({ totalRealizedPnl: "10.00000000" });

    const response = await request(createApp()).get("/api/v1/analytics/summary");

    expect(response.status).toBe(200);
    expect(response.body.data.totalRealizedPnl).toBe("10.00000000");
  });

  it("GET /api/v1/analytics/performance-calendar returns daily rows", async () => {
    analyticsServiceMock.getPerformanceCalendar.mockResolvedValue([{ date: "2026-04-01", pnl: "10.00000000" }]);

    const response = await request(createApp()).get("/api/v1/analytics/performance-calendar");

    expect(response.status).toBe(200);
    expect(response.body.data[0].date).toBe("2026-04-01");
  });

  it("GET /api/v1/analytics/tag-insights returns tag insights", async () => {
    analyticsServiceMock.getTagInsights.mockResolvedValue({ setup: [], review: [] });

    const response = await request(createApp()).get("/api/v1/analytics/tag-insights");

    expect(response.status).toBe(200);
    expect(response.body.data.setup).toEqual([]);
  });

  it("GET /api/v1/analytics/pnl-series returns pnl series", async () => {
    analyticsServiceMock.getPnlSeries.mockResolvedValue([{ date: "2026-04-01", cumulativePnl: "10.00000000" }]);

    const response = await request(createApp()).get("/api/v1/analytics/pnl-series");

    expect(response.status).toBe(200);
    expect(response.body.data[0].cumulativePnl).toBe("10.00000000");
  });

  it("GET /api/v1/analytics/holding-time returns holding time stats", async () => {
    analyticsServiceMock.getHoldingTime.mockResolvedValue({ avgMinutes: 60, minMinutes: 30, maxMinutes: 90 });

    const response = await request(createApp()).get("/api/v1/analytics/holding-time");

    expect(response.status).toBe(200);
    expect(response.body.data.avgMinutes).toBe(60);
  });

  it("GET /api/v1/analytics/win-loss returns win loss stats", async () => {
    analyticsServiceMock.getWinLoss.mockResolvedValue({ wins: 3, losses: 1, neutral: 1, winRate: 75 });

    const response = await request(createApp()).get("/api/v1/analytics/win-loss");

    expect(response.status).toBe(200);
    expect(response.body.data.wins).toBe(3);
  });
});
