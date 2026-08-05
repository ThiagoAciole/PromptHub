import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { AppConfig } from "./config/env.js";

export interface BuildAppOptions {
  config: AppConfig;
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions): FastifyInstance {
  const { config } = options;
  const app = Fastify({
    logger: options.logger ?? config.nodeEnv !== "test",
    bodyLimit: config.maxUploadSizeMb * 1024 * 1024,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID()
  });

  void app.register(cors, {
    origin: config.corsOrigins.length > 0 ? config.corsOrigins : false
  });
  void app.register(multipart, {
    limits: { fileSize: config.maxUploadSizeMb * 1024 * 1024 }
  });
  void app.register(swagger, {
    openapi: {
      info: { title: "Prompt Hub API", version: "0.1.0" },
      servers: [{ url: "/api/v1" }],
      tags: [
        { name: "System" },
        { name: "Prompts" },
        { name: "Categories" },
        { name: "Subcategories" },
        { name: "Tags" },
        { name: "Imports" },
        { name: "Exports" }
      ]
    }
  });
  void app.register(swaggerUi, { routePrefix: "/docs" });

  return app;
}
