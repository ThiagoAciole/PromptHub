import type { FastifyPluginAsync } from "fastify";
import { importCsv } from "./import.service.js";

export const importRoutes: FastifyPluginAsync = async (app) => {
  app.post("/csv", async (request, reply) => {
    const file = await request.file();
    if (!file) return reply.code(400).send({ error: { code: "IMPORT_FILE_REQUIRED", message: "Arquivo CSV é obrigatório", statusCode: 400, details: null } });
    if (!file.filename.toLowerCase().endsWith(".csv")) return reply.code(400).send({ error: { code: "IMPORT_INVALID_FILE", message: "A extensão deve ser .csv", statusCode: 400, details: null } });
    const summary = await importCsv(file.file, { db: app.db });
    return reply.code(201).send(summary);
  });
};
