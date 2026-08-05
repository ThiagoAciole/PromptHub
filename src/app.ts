import multipart from "@fastify/multipart";
import Fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { AppConfig } from "./config/env.js";
import { corsPlugin } from "./plugins/cors.js";
import { databasePlugin } from "./plugins/database.js";
import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { categoryRoutes } from "./modules/categories/category.routes.js";
import { subcategoryRoutes } from "./modules/subcategories/subcategory.routes.js";
import { tagRoutes } from "./modules/tags/tag.routes.js";
import { promptRoutes } from "./modules/prompts/prompt.routes.js";
import { importRoutes } from "./modules/imports/import.routes.js";
import { exportRoutes } from "./modules/exports/export.routes.js";
import { systemRoutes } from "./modules/system/system.routes.js";

export interface BuildAppOptions {
  config: AppConfig;
  databaseUrl?: string;
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions): FastifyInstance {
  const { config } = options;
  const loggerEnabled = options.logger ?? config.nodeEnv !== "test";
  const app = Fastify({
    logger: loggerEnabled ? { level: config.logLevel } : false,
    bodyLimit: config.maxUploadSizeMb * 1024 * 1024,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID()
  });

  void app.register(corsPlugin, { origins: config.corsOrigins, nodeEnv: config.nodeEnv });
  void app.register(multipart, {
    limits: { fileSize: config.maxUploadSizeMb * 1024 * 1024 }
  });
  void app.register(databasePlugin, {
    databaseUrl: options.databaseUrl ?? config.databaseUrl
  });
  void app.register(swaggerPlugin);
  void app.register(errorHandlerPlugin, { production: config.nodeEnv === "production" });
  void app.register(categoryRoutes, { prefix: "/api/v1/categories" });
  void app.register(subcategoryRoutes, { prefix: "/api/v1/subcategories" });
  void app.register(tagRoutes, { prefix: "/api/v1/tags" });
  void app.register(promptRoutes, { prefix: "/api/v1/prompts" });
  void app.register(importRoutes, { prefix: "/api/v1/imports" });
  void app.register(exportRoutes, { prefix: "/api/v1/exports" });
  void app.register(systemRoutes);

  return app;
}
