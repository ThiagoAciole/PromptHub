import multipart from "@fastify/multipart";
import Fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { AppConfig } from "./config/env.js";
import { importRoutes } from "./modules/imports/import.routes.js";
import { promptRoutes } from "./modules/prompts/prompt.routes.js";
import { systemRoutes } from "./modules/system/system.routes.js";
import { corsPlugin } from "./plugins/cors.js";
import { databasePlugin } from "./plugins/database.js";
import { errorHandlerPlugin } from "./plugins/error-handler.js";

export interface BuildAppOptions { config: AppConfig; databaseUrl?: string; logger?: boolean }
export function buildApp(options: BuildAppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? options.config.nodeEnv !== "test", bodyLimit: options.config.maxUploadSizeMb * 1024 * 1024, requestIdHeader: "x-request-id", genReqId: () => randomUUID() });
  void app.register(corsPlugin, { origins: options.config.corsOrigins, nodeEnv: options.config.nodeEnv });
  void app.register(multipart, { limits: { fileSize: options.config.maxUploadSizeMb * 1024 * 1024 } });
  void app.register(databasePlugin, { databaseUrl: options.databaseUrl ?? options.config.databaseUrl });
  void app.register(errorHandlerPlugin, { production: options.config.nodeEnv === "production" });
  void app.register(promptRoutes, { prefix: "/api/v1/prompts" });
  void app.register(importRoutes, { prefix: "/api/v1/prompts/import" });
  void app.register(systemRoutes);
  return app;
}
