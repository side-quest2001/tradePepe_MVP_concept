import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const journalServiceMock = {
  createManualOrder: vi.fn(),
  listOrders: vi.fn(),
  listOrderGroups: vi.fn(),
  getOrderGroupById: vi.fn(),
  updateOrderGroup: vi.fn(),
  createTradeNote: vi.fn(),
  listTradeNotes: vi.fn(),
  getOrderGroupChart: vi.fn(),
  assignSetupTag: vi.fn(),
  assignReviewTag: vi.fn(),
  publishTradeGroup: vi.fn(),
  getPublishedTradeGroup: vi.fn(),
  updatePublishedTradeGroup: vi.fn()
};

vi.mock("../src/services/journal.service.js", () => ({
  journalService: journalServiceMock
}));

const { createApp } = await import("../src/app.js");

const validGroupId = "33333333-3333-4333-8333-333333333333";
const validFundId = "11111111-1111-4111-8111-111111111111";

describe("Journal API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/v1/orders/manual creates a manual order", async () => {
    journalServiceMock.createManualOrder.mockResolvedValue({
      order: { id: "order-1", symbol: "NIFTY" },
      orderGroup: { id: validGroupId, symbol: "NIFTY" }
    });

    const response = await request(createApp()).post("/api/v1/orders/manual").send({
      fundId: validFundId,
      symbol: "NIFTY",
      side: "buy",
      orderType: "MARKET",
      productType: "MIS",
      qty: "2.00000000",
      tradedPrice: "123.45000000",
      status: "filled",
      executedAt: "2026-04-05T10:30:00.000Z"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.order.id).toBe("order-1");
  });

  it("GET /api/v1/orders returns paginated orders", async () => {
    journalServiceMock.listOrders.mockResolvedValue({
      items: [{ id: "order-1", symbol: "NIFTY" }],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1
    });

    const response = await request(createApp()).get("/api/v1/orders?page=1&pageSize=20");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.pagination.total).toBe(1);
  });

  it("GET /api/v1/order-groups returns paginated order groups", async () => {
    journalServiceMock.listOrderGroups.mockResolvedValue({
      items: [{ id: validGroupId, symbol: "NIFTY" }],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1
    });

    const response = await request(createApp()).get("/api/v1/order-groups?page=1&pageSize=20");

    expect(response.status).toBe(200);
    expect(response.body.data[0].id).toBe(validGroupId);
  });

  it("GET /api/v1/order-groups/:id returns one group", async () => {
    journalServiceMock.getOrderGroupById.mockResolvedValue({ id: validGroupId, symbol: "NIFTY" });

    const response = await request(createApp()).get(`/api/v1/order-groups/${validGroupId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(validGroupId);
  });

  it("PATCH /api/v1/order-groups/:id updates a group", async () => {
    journalServiceMock.updateOrderGroup.mockResolvedValue({ id: validGroupId, notes: "updated" });

    const response = await request(createApp()).patch(`/api/v1/order-groups/${validGroupId}`).send({
      notes: "updated"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.notes).toBe("updated");
  });

  it("POST /api/v1/order-groups/:id/notes creates a note", async () => {
    journalServiceMock.createTradeNote.mockResolvedValue({ id: "note-1", content: "A note" });

    const response = await request(createApp()).post(`/api/v1/order-groups/${validGroupId}/notes`).send({
      noteType: "review",
      content: "A note"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe("note-1");
  });

  it("GET /api/v1/order-groups/:id/notes returns notes", async () => {
    journalServiceMock.listTradeNotes.mockResolvedValue([{ id: "note-1", content: "A note" }]);

    const response = await request(createApp()).get(`/api/v1/order-groups/${validGroupId}/notes`);

    expect(response.status).toBe(200);
    expect(response.body.data[0].id).toBe("note-1");
  });

  it("POST /api/v1/order-groups/:id/setup-tags assigns a setup tag", async () => {
    journalServiceMock.assignSetupTag.mockResolvedValue({ id: "tag-1", slug: "breakout" });

    const response = await request(createApp()).post(`/api/v1/order-groups/${validGroupId}/setup-tags`).send({
      tagSlug: "breakout"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe("breakout");
  });

  it("POST /api/v1/order-groups/:id/review-tags assigns a review tag", async () => {
    journalServiceMock.assignReviewTag.mockResolvedValue({ id: "tag-2", slug: "patience" });

    const response = await request(createApp()).post(`/api/v1/order-groups/${validGroupId}/review-tags`).send({
      tagSlug: "patience"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe("patience");
  });

  it("POST /api/v1/order-groups/:id/publish publishes a group", async () => {
    journalServiceMock.publishTradeGroup.mockResolvedValue({ id: "pub-1", publicId: "trade-1" });

    const response = await request(createApp()).post(`/api/v1/order-groups/${validGroupId}/publish`).send({
      title: "Trade title",
      summary: "Trade summary"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.publicId).toBe("trade-1");
  });

  it("GET /api/v1/order-groups/:id/publish returns the current publish payload", async () => {
    journalServiceMock.getPublishedTradeGroup.mockResolvedValue({ id: "pub-1", publicId: "trade-1" });

    const response = await request(createApp()).get(`/api/v1/order-groups/${validGroupId}/publish`);

    expect(response.status).toBe(200);
    expect(response.body.data.publicId).toBe("trade-1");
  });

  it("PATCH /api/v1/order-groups/:id/publish updates the current publish payload", async () => {
    journalServiceMock.updatePublishedTradeGroup.mockResolvedValue({ id: "pub-1", title: "Updated title" });

    const response = await request(createApp()).patch(`/api/v1/order-groups/${validGroupId}/publish`).send({
      title: "Updated title"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated title");
  });

  it("GET /api/v1/order-groups/:id/chart returns chart data", async () => {
    journalServiceMock.getOrderGroupChart.mockResolvedValue({
      orderMarkers: [],
      pnlSeries: [],
      summary: {
        entryAvg: "100.00000000",
        exitAvg: "110.00000000",
        remainingQuantity: "0.00000000"
      }
    });

    const response = await request(createApp()).get(`/api/v1/order-groups/${validGroupId}/chart`);

    expect(response.status).toBe(200);
    expect(response.body.data.summary.entryAvg).toBe("100.00000000");
  });

  it("returns validation error for invalid manual order payload", async () => {
    const response = await request(createApp()).post("/api/v1/orders/manual").send({
      fundId: validFundId,
      symbol: "NIFTY"
    });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Validation failed");
  });
});
