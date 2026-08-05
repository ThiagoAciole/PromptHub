import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadEnv } from "../../src/config/env.js";

describe("buildApp", () => {
  it("applies LOG_LEVEL to the Fastify logger", async () => {
    const config = loadEnv({
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: "3333",
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      CORS_ORIGINS: "",
      MAX_UPLOAD_SIZE_MB: "10",
      LOG_LEVEL: "debug"
    });
    const app = buildApp({ config, logger: true });

    expect(app.log.level).toBe("debug");
    await app.close();
  });
});
