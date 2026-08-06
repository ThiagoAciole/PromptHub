import type { FastifyPluginAsync } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { importCsv } from "./import.service.js";
export const importRoutes: FastifyPluginAsync = async (app) => { app.post("/", async (request, reply) => { const file = await (request as unknown as { file: () => Promise<{ filename: string; file: import("node:stream").Readable } | undefined> }).file(); if (!file?.filename.toLowerCase().endsWith(".csv")) throw new AppError("VALIDATION_ERROR", 400, "Arquivo CSV é obrigatório"); return reply.code(201).send(await importCsv(file.file, app.db)); }); };
