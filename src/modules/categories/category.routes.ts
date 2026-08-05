import { Type } from "@sinclair/typebox";
import { asc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { categories } from "../../database/schema/categories.js";

const bodySchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 120 }),
  slug: Type.String({ minLength: 1, maxLength: 140 }),
  description: Type.Optional(Type.String())
});
const paramsSchema = Type.Object({ id: Type.String({ format: "uuid" }) });

export const categoryRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => app.db.select().from(categories).orderBy(asc(categories.name)));

  app.post<{ Body: { name: string; slug: string; description?: string } }>(
    "/",
    { schema: { body: bodySchema } },
    async (request, reply) => {
      try {
        const [category] = await app.db.insert(categories).values(request.body).returning();
        return reply.code(201).send(category);
      } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
          throw new AppError("CONFLICT", 409, "Slug de categoria já existe");
        }
        throw error;
      }
    }
  );

  app.get<{ Params: { id: string } }>("/:id", { schema: { params: paramsSchema } }, async (request) => {
    const [category] = await app.db.select().from(categories).where(eq(categories.id, request.params.id));
    if (!category) throw new AppError("NOT_FOUND", 404, "Categoria não encontrada");
    return category;
  });

  app.patch<{ Params: { id: string }; Body: Partial<{ name: string; slug: string; description: string }> }>(
    "/:id",
    { schema: { params: paramsSchema, body: Type.Partial(bodySchema) } },
    async (request) => {
      const [category] = await app.db
        .update(categories)
        .set({ ...request.body, updatedAt: new Date() })
        .where(eq(categories.id, request.params.id))
        .returning();
      if (!category) throw new AppError("NOT_FOUND", 404, "Categoria não encontrada");
      return category;
    }
  );

  app.delete<{ Params: { id: string } }>("/:id", { schema: { params: paramsSchema } }, async (request, reply) => {
    const deleted = await app.db.delete(categories).where(eq(categories.id, request.params.id)).returning({ id: categories.id });
    if (deleted.length === 0) throw new AppError("NOT_FOUND", 404, "Categoria não encontrada");
    return reply.code(204).send();
  });
};
