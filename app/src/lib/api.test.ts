import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, listPrompts, updatePrompt } from "./api";

afterEach(() => vi.restoreAllMocks());

describe("api client", () => {
  it("returns a typed prompt page", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ data: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } }), { status: 200 }));
    await expect(listPrompts({ page: 1, limit: 24, sort: "updatedAt", order: "desc" })).resolves.toEqual({ data: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } });
  });

  it("throws ApiError for non-success responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ message: "Falha" }), { status: 500 }));
    await expect(listPrompts({ page: 1, limit: 24, sort: "updatedAt", order: "desc" })).rejects.toMatchObject({ name: "ApiError", status: 500, message: "Falha" });
  });

  it("patches a prompt", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "p1", favorite: true }), { status: 200 }));
    await updatePrompt("p1", { favorite: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/prompts/p1", expect.objectContaining({ method: "PATCH" }));
  });

  it("exposes the API error type", () => {
    expect(new ApiError(400, "x")).toBeInstanceOf(Error);
  });
});
