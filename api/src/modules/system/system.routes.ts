import { sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
export const systemRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async (_request, reply) => { try { await app.db.execute(sql`select 1`); return { status: "ok" }; } catch { return reply.code(503).send({ status: "degraded" }); } });
  app.get("/api/v1/info", async () => ({ name: "Prompt Hub API", version: "1.0.0", prefix: "/api/v1" }));
};
