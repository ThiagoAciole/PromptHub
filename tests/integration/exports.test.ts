import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { integrationEnabled, createIntegrationApp } from "./test-database.js";

const suite = integrationEnabled ? describe : describe.skip;

suite("exports integration", () => {
  const app = createIntegrationApp();
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  it("returns JSON and CSV export formats", async () => {
    const json = await app.inject({ method: "GET", url: "/api/v1/exports/json" });
    const csv = await app.inject({ method: "GET", url: "/api/v1/exports/csv" });
    expect(json.statusCode).toBe(200);
    expect(csv.statusCode).toBe(200);
    expect(csv.headers["content-type"]).toContain("text/csv");
  });
});
