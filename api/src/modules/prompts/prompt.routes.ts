import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { createPromptService } from "./prompt.service.js";
import { promptBody, promptBulkDeleteBody, promptDeleteAllBody, promptListQuery, promptParams } from "./prompt.schemas.js";
import type { PromptBulkDeleteInput, PromptDeleteAllInput, PromptInput, PromptListQueryInput, PromptPatch } from "./prompt.types.js";

export const promptRoutes: FastifyPluginAsync = async (app) => {
  const service = createPromptService(app.db);

  app.post<{ Body: PromptInput }>("/", { schema: { body: promptBody } }, async (request, reply) =>
    reply.code(201).send(await service.create(request.body)));

  app.get<{ Querystring: PromptListQueryInput }>("/", { schema: { querystring: promptListQuery } }, async (request) =>
    service.list(request.query));

  app.get("/categories", async () => service.listCategories());

  app.delete<{ Body: PromptBulkDeleteInput }>("/batch", { schema: { body: promptBulkDeleteBody } }, async (request) =>
    ({ deletedCount: await service.removeMany(request.body.ids) }));

  app.delete<{ Body: PromptDeleteAllInput }>("/", { schema: { body: promptDeleteAllBody } }, async (request) =>
    ({ deletedCount: await service.removeAll(request.body.confirm) }));

  app.get<{ Params: { id: string } }>("/:id", { schema: { params: promptParams } }, async (request) =>
    service.getById(request.params.id));

  app.patch<{ Params: { id: string }; Body: PromptPatch }>("/:id", { schema: { params: promptParams, body: Type.Partial(promptBody) } }, async (request) =>
    service.update(request.params.id, request.body));

  app.delete<{ Params: { id: string } }>("/:id", { schema: { params: promptParams } }, async (request, reply) => {
    await service.remove(request.params.id);
    return reply.code(204).send();
  });
};
