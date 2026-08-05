import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/config/env.js";

const validEnv = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "3333",
  DATABASE_URL: "postgres://test:test@localhost:5432/test",
  CORS_ORIGINS: "http://localhost:3000",
  MAX_UPLOAD_SIZE_MB: "10",
  LOG_LEVEL: "silent"
};

describe("loadEnv", () => {
  it("rejects an invalid HOST with a clear message", () => {
    expect(() => loadEnv({ ...validEnv, HOST: "not a host" })).toThrow(
      "Variável de ambiente inválida: HOST"
    );
  });

  it("rejects an invalid CORS origin with a clear message", () => {
    expect(() => loadEnv({ ...validEnv, CORS_ORIGINS: "http://localhost:3000,not-an-origin" })).toThrow(
      "Variável de ambiente inválida: CORS_ORIGINS"
    );
  });

  it("rejects a non-PostgreSQL DATABASE_URL with a clear message", () => {
    expect(() => loadEnv({ ...validEnv, DATABASE_URL: "https://localhost/database" })).toThrow(
      "Variável de ambiente inválida: DATABASE_URL"
    );
  });

  it("rejects wildcard CORS outside development", () => {
    expect(() => loadEnv({ ...validEnv, CORS_ORIGINS: "*" })).toThrow(
      "CORS_ORIGINS=* só é permitido em development"
    );
  });
});
