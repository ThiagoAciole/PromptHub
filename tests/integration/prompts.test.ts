import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { integrationEnabled, createIntegrationApp } from "./test-database.js";

const suite = integrationEnabled ? describe : describe.skip;

suite("prompts integration", () => {
  const app = createIntegrationApp();
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  it("creates and lists a prompt with pagination", async () => {
    const created = await app.inject({ method: "POST", url: "/api/v1/prompts", payload: { title: `Integration ${Date.now()}`, content: "Conteúdo de integração" } });
    expect(created.statusCode).toBe(201);
    const listed = await app.inject({ method: "GET", url: "/api/v1/prompts?page=1&limit=20" });
    expect(listed.statusCode).toBe(200);
    expect(listed.json()).toHaveProperty("pagination.totalPages");
  });
});
