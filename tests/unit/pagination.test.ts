import { describe, expect, it } from "vitest";
import { parsePagination } from "../../src/shared/pagination/pagination.js";

describe("parsePagination", () => {
  it("uses defaults and calculates total pages", () => {
    expect(parsePagination({ page: "2", limit: "20", total: 45 })).toEqual({
      page: 2,
      limit: 20,
      offset: 20,
      total: 45,
      totalPages: 3
    });
  });

  it("caps limit at 100", () => {
    expect(parsePagination({ limit: "500", total: 0 }).limit).toBe(100);
  });
});
