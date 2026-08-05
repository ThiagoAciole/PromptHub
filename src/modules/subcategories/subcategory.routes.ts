import { Type } from "@sinclair/typebox";
import { asc, eq, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { subcategories } from "../../database/schema/subcategories.js";
import { prompts } from "../../database/schema/prompts.js";
import { AppError } from "../../shared/errors/app-error.js";
import { normalizeSlug } from "../../shared/slug/normalize-slug.js";

const bodySchema = Type.Object({
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
  name: Type.String({ minLength: 1, maxLength: 120 }),
  slug: Type.String({ minLength: 1, maxLength: 140 }),
  description: Type.Optional(Type.String())
});
const paramsSchema = Type.Object({ id: Type.String({ format: "uuid" }) });

export const subcategoryRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => app.db.select({ id: subcategories.id, categoryId: subcategories.categoryId, name: subcategories.name, slug: subcategories.slug, description: subcategories.description, createdAt: subcategories.createdAt, updatedAt: subcategories.updatedAt, promptCount: sql<number>`(select count(*)::int from ${prompts} where ${prompts.subcategoryId} = ${subcategories.id})` }).from(subcategories).orderBy(asc(subcategories.name)));
  app.post<{ Body: { categoryId?: string; name: string; slug: string; description?: string } }>(
    "/",
    { schema: { body: bodySchema } },
    async (request, reply) => {
      const [subcategory] = await app.db.insert(subcategories).values({ ...request.body, slug: normalizeSlug(request.body.slug) }).returning();
      return reply.code(201).send(subcategory);
    }
  );
  app.get<{ Params: { id: string } }>("/:id", { schema: { params: paramsSchema } }, async (request) => {
    const [subcategory] = await app.db.select().from(subcategories).where(eq(subcategories.id, request.params.id));
    if (!subcategory) throw new AppError("NOT_FOUND", 404, "Subcategoria não encontrada");
    return subcategory;
  });
  app.patch<{ Params: { id: string }; Body: Partial<{ categoryId: string; name: string; slug: string; description: string }> }>(
    "/:id",
    { schema: { params: paramsSchema, body: Type.Partial(bodySchema) } },
    async (request) => {
      const [subcategory] = await app.db.update(subcategories).set({ ...request.body, ...(request.body.slug === undefined ? {} : { slug: normalizeSlug(request.body.slug) }), updatedAt: new Date() }).where(eq(subcategories.id, request.params.id)).returning();
      if (!subcategory) throw new AppError("NOT_FOUND", 404, "Subcategoria não encontrada");
      return subcategory;
    }
  );
  app.delete<{ Params: { id: string } }>("/:id", { schema: { params: paramsSchema } }, async (request, reply) => {
    const deleted = await app.db.delete(subcategories).where(eq(subcategories.id, request.params.id)).returning({ id: subcategories.id });
    if (deleted.length === 0) throw new AppError("NOT_FOUND", 404, "Subcategoria não encontrada");
    return reply.code(204).send();
  });
};
