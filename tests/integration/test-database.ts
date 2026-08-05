import { buildApp } from "../../src/app.js";
import { loadEnv } from "../../src/config/env.js";

export const integrationEnabled = Boolean(process.env.DATABASE_URL);

export function createIntegrationApp() {
  const config = loadEnv({
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL: process.env.DATABASE_URL ?? "postgres://test:test@localhost:5432/prompt_hub_test",
    CORS_ORIGINS: "",
    LOG_LEVEL: "silent"
  });
  return buildApp({ config, logger: false, databaseUrl: config.databaseUrl });
}
