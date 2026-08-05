import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { prompts } from "../../database/schema/prompts.js";
import { promptTags } from "../../database/schema/prompt-tags.js";
import { tags } from "../../database/schema/tags.js";
import type { PromptFilters } from "./prompt.types.js";

export function createPromptRepository(db: Database) {
  return {
    async list(filters: PromptFilters) {
      const conditions = [
        filters.categoryId ? eq(prompts.categoryId, filters.categoryId) : undefined,
        filters.subcategoryId ? eq(prompts.subcategoryId, filters.subcategoryId) : undefined,
        filters.tag ? sql`exists (select 1 from ${promptTags} pt join ${tags} t on t.id = pt.tag_id where pt.prompt_id = ${prompts.id} and t.slug = ${filters.tag})` : undefined,
        filters.language ? eq(prompts.language, filters.language) : undefined,
        filters.type ? eq(prompts.type, filters.type) : undefined,
        filters.favorite === undefined ? undefined : eq(prompts.favorite, filters.favorite),
        filters.archived === undefined ? undefined : eq(prompts.archived, filters.archived),
        filters.search
          ? or(
              ilike(prompts.title, `%${filters.search}%`),
              ilike(prompts.description, `%${filters.search}%`),
              ilike(prompts.content, `%${filters.search}%`),
              ilike(prompts.originalTitle, `%${filters.search}%`),
              ilike(prompts.originalContent, `%${filters.search}%`),
              ilike(prompts.contributor, `%${filters.search}%`)
            )
          : undefined
      ].filter((condition): condition is NonNullable<typeof condition> => condition !== undefined);
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const orderColumn = filters.sort === "title" ? prompts.title : filters.sort === "createdAt" ? prompts.createdAt : prompts.updatedAt;
      const orderBy = filters.order === "asc" ? asc(orderColumn) : desc(orderColumn);
      const rows = await db.select().from(prompts).where(where).orderBy(orderBy).limit(filters.limit).offset((filters.page - 1) * filters.limit);
      const [totalRow] = await db.select({ total: sql<number>`count(*)::int` }).from(prompts).where(where);
      return { rows, total: totalRow?.total ?? 0 };
    }
  };
}
