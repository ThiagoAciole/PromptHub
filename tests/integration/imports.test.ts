import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { integrationEnabled, createIntegrationApp } from "./test-database.js";

const suite = integrationEnabled ? describe : describe.skip;

suite("imports integration", () => {
  const app = createIntegrationApp();
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  it("imports a small CSV multipart payload", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/imports/csv",
      payload: { file: { value: "act,prompt,for_devs\nIntegration CSV,Conteúdo,true\n", options: { filename: "integration.csv", contentType: "text/csv" } } }
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ received: 1, created: 1 });
  });
});
