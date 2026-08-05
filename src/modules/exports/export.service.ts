import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { categories } from "../../database/schema/categories.js";
import { promptTags } from "../../database/schema/prompt-tags.js";
import { prompts } from "../../database/schema/prompts.js";
import { subcategories } from "../../database/schema/subcategories.js";
import { tags } from "../../database/schema/tags.js";
import type { PromptFilters } from "../prompts/prompt.types.js";

export interface PromptExportRow {
  id: string;
  title: string;
  content: string;
  originalTitle: string | null;
  originalContent: string | null;
  description: string | null;
  type: string;
  language: string;
  contributor: string | null;
  forDevelopers: boolean;
  favorite: boolean;
  archived: boolean;
  category: string | null;
  subcategory: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function exportPrompts(db: Database, filters: PromptFilters): Promise<PromptExportRow[]> {
  const conditions = [
    filters.categoryId ? eq(prompts.categoryId, filters.categoryId) : undefined,
    filters.subcategoryId ? eq(prompts.subcategoryId, filters.subcategoryId) : undefined,
    filters.tag ? sql`exists (select 1 from ${promptTags} pt join ${tags} t on t.id = pt.tag_id where pt.prompt_id = ${prompts.id} and t.slug = ${filters.tag})` : undefined,
    filters.language ? eq(prompts.language, filters.language) : undefined,
    filters.type ? eq(prompts.type, filters.type) : undefined,
    filters.favorite === undefined ? undefined : eq(prompts.favorite, filters.favorite),
    filters.archived === undefined ? undefined : eq(prompts.archived, filters.archived),
    filters.search ? or(ilike(prompts.title, `%${filters.search}%`), ilike(prompts.description, `%${filters.search}%`), ilike(prompts.content, `%${filters.search}%`), ilike(prompts.originalTitle, `%${filters.search}%`), ilike(prompts.originalContent, `%${filters.search}%`), ilike(prompts.contributor, `%${filters.search}%`)) : undefined
  ].filter((condition): condition is NonNullable<typeof condition> => condition !== undefined);
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const orderColumn = filters.sort === "title" ? prompts.title : filters.sort === "createdAt" ? prompts.createdAt : prompts.updatedAt;
  const orderBy = filters.order === "asc" ? asc(orderColumn) : desc(orderColumn);
  return db
    .select({
      id: prompts.id,
      title: prompts.title,
      content: prompts.content,
      originalTitle: prompts.originalTitle,
      originalContent: prompts.originalContent,
      description: prompts.description,
      type: prompts.type,
      language: prompts.language,
      contributor: prompts.contributor,
      forDevelopers: prompts.forDevelopers,
      favorite: prompts.favorite,
      archived: prompts.archived,
      category: categories.name,
      subcategory: subcategories.name,
      tags: sql<string[]>`coalesce(array_agg(distinct ${tags.name}) filter (where ${tags.name} is not null), '{}')`,
      createdAt: prompts.createdAt,
      updatedAt: prompts.updatedAt
    })
    .from(prompts)
    .leftJoin(categories, eq(prompts.categoryId, categories.id))
    .leftJoin(subcategories, eq(prompts.subcategoryId, subcategories.id))
    .leftJoin(promptTags, eq(prompts.id, promptTags.promptId))
    .leftJoin(tags, eq(promptTags.tagId, tags.id))
    .where(where)
    .groupBy(prompts.id, categories.name, subcategories.name)
    .orderBy(orderBy)
    .offset((filters.page - 1) * filters.limit);
}

function csvValue(value: unknown): string {
  const text = value instanceof Date ? value.toISOString() : Array.isArray(value) ? value.join(",") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function serializeCsv(rows: PromptExportRow[]): string {
  const headers = ["id", "title", "content", "original_title", "original_content", "description", "type", "language", "contributor", "category", "subcategory", "tags", "for_developers", "favorite", "archived", "created_at", "updated_at"];
  const lines = rows.map((row) => [row.id, row.title, row.content, row.originalTitle, row.originalContent, row.description, row.type, row.language, row.contributor, row.category, row.subcategory, row.tags, row.forDevelopers, row.favorite, row.archived, row.createdAt, row.updatedAt].map(csvValue).join(","));
  return [headers.join(","), ...lines].join("\n") + "\n";
}
