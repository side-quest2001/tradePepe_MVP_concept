import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const resourceServiceMock = {
  listTags: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  listFunds: vi.fn(),
  createFund: vi.fn(),
  updateFund: vi.fn(),
  listImports: vi.fn(),
  getImportById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn()
};

vi.mock("../src/services/resource.service.js", () => ({
  resourceService: resourceServiceMock
}));

const { createApp } = await import("../src/app.js");

const validId = "11111111-1111-4111-8111-111111111111";

describe("Resource API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/tags returns tags", async () => {
    resourceServiceMock.listTags.mockResolvedValue([{ id: validId, slug: "breakout" }]);

    const response = await request(createApp()).get("/api/v1/tags?type=setup");

    expect(response.status).toBe(200);
    expect(response.body.data[0].slug).toBe("breakout");
  });

  it("POST /api/v1/tags creates a tag", async () => {
    resourceServiceMock.createTag.mockResolvedValue({ id: validId, slug: "breakout" });

    const response = await request(createApp()).post("/api/v1/tags").send({
      name: "Breakout",
      type: "setup",
      color: "#ff0000"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe("breakout");
  });

  it("PATCH /api/v1/tags/:id updates a tag", async () => {
    resourceServiceMock.updateTag.mockResolvedValue({ id: validId, name: "Updated" });

    const response = await request(createApp()).patch(`/api/v1/tags/${validId}`).send({
      name: "Updated"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Updated");
  });

  it("GET /api/v1/funds returns funds", async () => {
    resourceServiceMock.listFunds.mockResolvedValue([{ id: validId, name: "Main Fund" }]);

    const response = await request(createApp()).get("/api/v1/funds");

    expect(response.status).toBe(200);
    expect(response.body.data[0].name).toBe("Main Fund");
  });

  it("POST /api/v1/funds creates a fund", async () => {
    resourceServiceMock.createFund.mockResolvedValue({ id: validId, name: "Main Fund" });

    const response = await request(createApp()).post("/api/v1/funds").send({
      name: "Main Fund",
      currency: "INR"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe(validId);
  });

  it("PATCH /api/v1/funds/:id updates a fund", async () => {
    resourceServiceMock.updateFund.mockResolvedValue({ id: validId, brokerName: "Zerodha" });

    const response = await request(createApp()).patch(`/api/v1/funds/${validId}`).send({
      brokerName: "Zerodha"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.brokerName).toBe("Zerodha");
  });

  it("GET /api/v1/imports returns paginated imports", async () => {
    resourceServiceMock.listImports.mockResolvedValue({
      items: [{ importId: validId }],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1
    });

    const response = await request(createApp()).get("/api/v1/imports?page=1&pageSize=20");

    expect(response.status).toBe(200);
    expect(response.body.data[0].importId).toBe(validId);
    expect(response.body.meta.pagination.total).toBe(1);
  });

  it("GET /api/v1/imports/:id returns one import", async () => {
    resourceServiceMock.getImportById.mockResolvedValue({ importId: validId });

    const response = await request(createApp()).get(`/api/v1/imports/${validId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.importId).toBe(validId);
  });

  it("PATCH /api/v1/notes/:id updates a note", async () => {
    resourceServiceMock.updateNote.mockResolvedValue({ id: validId, content: "Updated note" });

    const response = await request(createApp()).patch(`/api/v1/notes/${validId}`).send({
      content: "Updated note"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.content).toBe("Updated note");
  });

  it("DELETE /api/v1/notes/:id deletes a note", async () => {
    resourceServiceMock.deleteNote.mockResolvedValue({ id: validId, deleted: true });

    const response = await request(createApp()).delete(`/api/v1/notes/${validId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.deleted).toBe(true);
  });
});
