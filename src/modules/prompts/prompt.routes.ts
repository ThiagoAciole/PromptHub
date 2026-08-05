import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { parsePagination } from "../../shared/pagination/pagination.js";
import { createPromptService } from "./prompt.service.js";
import { promptBody, promptParams } from "./prompt.schemas.js";
import type { PromptFilters, PromptInput } from "./prompt.types.js";

interface PromptQuery extends Partial<Omit<PromptFilters, "page" | "limit">> {
  page?: number;
  limit?: number;
}

const querySchema = Type.Object({
  search: Type.Optional(Type.String()), categoryId: Type.Optional(Type.String({ format: "uuid" })), subcategoryId: Type.Optional(Type.String({ format: "uuid" })), tag: Type.Optional(Type.String()),
  language: Type.Optional(Type.String()), type: Type.Optional(Type.String()), favorite: Type.Optional(Type.Boolean()), archived: Type.Optional(Type.Boolean()),
  page: Type.Optional(Type.Integer({ minimum: 1 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })), sort: Type.Optional(Type.Union([Type.Literal("title"), Type.Literal("createdAt"), Type.Literal("updatedAt")])), order: Type.Optional(Type.Union([Type.Literal("asc"), Type.Literal("desc")]))
});

export const promptRoutes: FastifyPluginAsync = async (app) => {
  const service = createPromptService(app.db);
  app.post<{ Body: PromptInput }>("/", { schema: { body: promptBody } }, async (request, reply) => reply.code(201).send(await service.create(request.body)));
  app.get<{ Querystring: PromptQuery }>("/", { schema: { querystring: querySchema } }, async (request) => {
    const query = request.query;
    const paginationInput = { total: 0, ...(query.page === undefined ? {} : { page: query.page }), ...(query.limit === undefined ? {} : { limit: query.limit }) };
    const pagination = parsePagination(paginationInput);
    const result = await service.list({ ...query, page: pagination.page, limit: pagination.limit, sort: query.sort ?? "createdAt", order: query.order ?? "desc" } as PromptFilters);
    return { data: result.rows, pagination: parsePagination({ page: pagination.page, limit: pagination.limit, total: result.total }) };
  });
  app.get<{ Params: { id: string } }>("/:id", { schema: { params: promptParams } }, async (request) => service.getById(request.params.id));
  app.patch<{ Params: { id: string }; Body: Partial<PromptInput> }>("/:id", { schema: { params: promptParams, body: Type.Partial(promptBody) } }, async (request) => service.update(request.params.id, request.body));
  app.delete<{ Params: { id: string } }>("/:id", { schema: { params: promptParams } }, async (request, reply) => { await service.remove(request.params.id); return reply.code(204).send(); });
  app.post<{ Params: { id: string } }>("/:id/duplicate", { schema: { params: promptParams } }, async (request, reply) => reply.code(201).send(await service.duplicate(request.params.id)));
};
