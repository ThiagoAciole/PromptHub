import { describe, expect, it } from "vitest";
import { buildQueryString } from "./query";

describe("buildQueryString", () => {
  it("serializes filters, booleans and pagination while omitting empty values", () => {
    expect(
      buildQueryString({ search: "  react ", favorite: false, tag: "", page: 1, limit: 24 }),
    ).toBe("search=react&favorite=false&page=1&limit=24");
  });
});
