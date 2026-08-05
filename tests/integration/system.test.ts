import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { integrationEnabled, createIntegrationApp } from "./test-database.js";

const suite = integrationEnabled ? describe : describe.skip;

suite("system integration", () => {
  const app = createIntegrationApp();
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  it("reports a healthy database and exposes OpenAPI", async () => {
    const health = await app.inject({ method: "GET", url: "/health" });
    const openapi = await app.inject({ method: "GET", url: "/api/v1/openapi.json" });
    expect(health.statusCode).toBe(200);
    expect(openapi.statusCode).toBe(200);
  });
});
