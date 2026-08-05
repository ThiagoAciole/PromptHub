import { Type } from "@sinclair/typebox";
import { asc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { tags } from "../../database/schema/tags.js";
import { AppError } from "../../shared/errors/app-error.js";

const bodySchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 80 }),
  slug: Type.String({ minLength: 1, maxLength: 100 })
});
const paramsSchema = Type.Object({ id: Type.String({ format: "uuid" }) });

export const tagRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => app.db.select().from(tags).orderBy(asc(tags.name)));
  app.post<{ Body: { name: string; slug: string } }>("/", { schema: { body: bodySchema } }, async (request, reply) => {
    try {
      const [tag] = await app.db.insert(tags).values(request.body).returning();
      return reply.code(201).send(tag);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        throw new AppError("CONFLICT", 409, "Slug de tag já existe");
      }
      throw error;
    }
  });
  app.get<{ Params: { id: string } }>("/:id", { schema: { params: paramsSchema } }, async (request) => {
    const [tag] = await app.db.select().from(tags).where(eq(tags.id, request.params.id));
    if (!tag) throw new AppError("NOT_FOUND", 404, "Tag não encontrada");
    return tag;
  });
  app.patch<{ Params: { id: string }; Body: Partial<{ name: string; slug: string }> }>(
    "/:id",
    { schema: { params: paramsSchema, body: Type.Partial(bodySchema) } },
    async (request) => {
      const [tag] = await app.db.update(tags).set({ ...request.body, updatedAt: new Date() }).where(eq(tags.id, request.params.id)).returning();
      if (!tag) throw new AppError("NOT_FOUND", 404, "Tag não encontrada");
      return tag;
    }
  );
  app.delete<{ Params: { id: string } }>("/:id", { schema: { params: paramsSchema } }, async (request, reply) => {
    const deleted = await app.db.delete(tags).where(eq(tags.id, request.params.id)).returning({ id: tags.id });
    if (deleted.length === 0) throw new AppError("NOT_FOUND", 404, "Tag não encontrada");
    return reply.code(204).send();
  });
};
