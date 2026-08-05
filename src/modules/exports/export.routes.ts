import type { FastifyPluginAsync } from "fastify";
import type { PromptFilters } from "../prompts/prompt.types.js";
import { exportPrompts, serializeCsv } from "./export.service.js";

function filters(query: Record<string, string | undefined>): PromptFilters {
  return {
    search: query.search,
    categoryId: query.categoryId,
    subcategoryId: query.subcategoryId,
    language: query.language,
    type: query.type,
    favorite: query.favorite === undefined ? undefined : query.favorite === "true",
    archived: query.archived === undefined ? undefined : query.archived === "true",
    page: 1,
    limit: 100,
    sort: query.sort === "title" || query.sort === "updatedAt" ? query.sort : "createdAt",
    order: query.order === "asc" ? "asc" : "desc"
  };
}

export const exportRoutes: FastifyPluginAsync = async (app) => {
  app.get("/json", async (request) => {
    return exportPrompts(app.db, filters(request.query as Record<string, string | undefined>));
  });
  app.get("/csv", async (request, reply) => {
    const content = serializeCsv(await exportPrompts(app.db, filters(request.query as Record<string, string | undefined>)));
    return reply
      .header("Content-Type", "text/csv; charset=utf-8")
      .header("Content-Disposition", "attachment; filename=prompts.csv")
      .send(content);
  });
};
