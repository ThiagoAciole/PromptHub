import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadEnv } from "../../src/config/env.js";

const config = loadEnv({
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "3333",
  DATABASE_URL: "postgres://test:test@localhost:5432/prompt_hub_test",
  CORS_ORIGINS: "",
  MAX_UPLOAD_SIZE_MB: "10",
  LOG_LEVEL: "silent"
});

describe("database plugin", () => {
  it("exposes app.db with an injected database URL", async () => {
    const app = buildApp({
      config,
      logger: false,
      databaseUrl: "postgres://test:test@localhost:5432/prompt_hub_test_isolated"
    });

    await app.ready();

    expect(app.db).toBeDefined();

    await app.close();
  });
});
