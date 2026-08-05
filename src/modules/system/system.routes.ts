import { sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

export const systemRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async (_request, reply) => {
    try {
      await app.db.execute(sql`select 1`);
      return { status: "ok", database: "ok", version: "0.1.0", timestamp: new Date().toISOString() };
    } catch {
      return reply.code(503).send({ status: "degraded", database: "unavailable", version: "0.1.0", timestamp: new Date().toISOString() });
    }
  });

  app.get("/api/v1/info", async () => ({ name: "Prompt Hub API", version: "0.1.0", prefix: "/api/v1" }));
  app.get("/api/v1/openapi.json", async () => app.swagger());
};
