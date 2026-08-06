import { and, arrayContains, asc, count, desc, eq, ilike, isNotNull, or } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { prompts } from "../../database/schema/prompts.js";
import type { PreparedPromptCreate, PreparedPromptPatch, PromptListQuery, PromptListResponse } from "./prompt.types.js";

export function createPromptRepository(db: Database) {
  return {
    create: async (input: PreparedPromptCreate) =>
      (await db.insert(prompts).values(input).returning())[0],

    list: async (query: PromptListQuery): Promise<PromptListResponse> => {
      const filters = [
        query.search
          ? or(
              ilike(prompts.title, `%${query.search}%`),
              ilike(prompts.description, `%${query.search}%`),
              ilike(prompts.content, `%${query.search}%`)
            )
          : undefined,
        query.category ? eq(prompts.category, query.category) : undefined,
        query.tag ? arrayContains(prompts.tags, [query.tag]) : undefined,
        query.type ? eq(prompts.type, query.type) : undefined,
        query.favorite === undefined ? undefined : eq(prompts.isFavorite, query.favorite),
        query.archived === undefined ? undefined : eq(prompts.isArchived, query.archived)
      ];
      const where = and(...filters);
      const sortColumn = query.sort === "title" ? prompts.title : query.sort === "updatedAt" ? prompts.updatedAt : prompts.createdAt;
      const orderBy = query.order === "asc" ? asc(sortColumn) : desc(sortColumn);
      const offset = (query.page - 1) * query.limit;

      const [data, totals] = await Promise.all([
        db.select().from(prompts).where(where).orderBy(orderBy).limit(query.limit).offset(offset),
        db.select({ total: count() }).from(prompts).where(where)
      ]);
      const total = totals[0]?.total ?? 0;

      return {
        data,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit)
        }
      };
    },

    get: async (id: string) =>
      (await db.select().from(prompts).where(eq(prompts.id, id)))[0],

    update: async (id: string, input: PreparedPromptPatch) =>
      (await db.update(prompts).set({ ...input, updatedAt: new Date() }).where(eq(prompts.id, id)).returning())[0],

    remove: async (id: string) =>
      (await db.delete(prompts).where(eq(prompts.id, id)).returning({ id: prompts.id }))[0],

    categories: async () =>
      (await db
        .selectDistinct({ category: prompts.category })
        .from(prompts)
        .where(isNotNull(prompts.category))
        .orderBy(asc(prompts.category)))
        .map((row) => row.category)
  };
}
