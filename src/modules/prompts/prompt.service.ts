import { eq } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { categories } from "../../database/schema/categories.js";
import { promptTags } from "../../database/schema/prompt-tags.js";
import { prompts } from "../../database/schema/prompts.js";
import { subcategories } from "../../database/schema/subcategories.js";
import { tags } from "../../database/schema/tags.js";
import { createPromptHash } from "../../shared/hashing/create-prompt-hash.js";
import { AppError } from "../../shared/errors/app-error.js";
import { normalizeSlug } from "../../shared/slug/normalize-slug.js";
import { createPromptRepository } from "./prompt.repository.js";
import type { PromptFilters, PromptInput } from "./prompt.types.js";

type DatabaseExecutor = Pick<Database, "select" | "insert" | "update" | "delete">;

async function validateTaxonomy(db: DatabaseExecutor, input: PromptInput): Promise<void> {
  if (input.categoryId && !(await db.select({ id: categories.id }).from(categories).where(eq(categories.id, input.categoryId))).length) {
    throw new AppError("NOT_FOUND", 404, "Categoria não encontrada");
  }
  if (input.subcategoryId) {
    const [subcategory] = await db.select().from(subcategories).where(eq(subcategories.id, input.subcategoryId));
    if (!subcategory) throw new AppError("NOT_FOUND", 404, "Subcategoria não encontrada");
    if (input.categoryId && subcategory.categoryId !== input.categoryId) {
      throw new AppError("CONFLICT", 409, "Subcategoria não pertence à categoria informada");
    }
  }
}

async function resolveTags(db: DatabaseExecutor, names: string[]) {
  const resolved = [] as Array<typeof tags.$inferSelect>;
  for (const name of names) {
    const slug = normalizeSlug(name);
    if (!slug) continue;
    const [existing] = await db.select().from(tags).where(eq(tags.slug, slug));
    if (existing) {
      resolved.push(existing);
      continue;
    }
    try {
      const [created] = await db.insert(tags).values({ name: name.trim(), slug }).returning();
      if (created) resolved.push(created);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        const [retry] = await db.select().from(tags).where(eq(tags.slug, slug));
        if (retry) resolved.push(retry);
      } else throw error;
    }
  }
  return resolved;
}

export function createPromptService(db: Database) {
  const repository = createPromptRepository(db);
  return {
    async create(input: PromptInput) {
      return db.transaction(async (tx) => {
        await validateTaxonomy(tx, input);
        const [prompt] = await tx
          .insert(prompts)
          .values({
            title: input.title,
            content: input.content,
            originalTitle: input.originalTitle,
            originalContent: input.originalContent,
            description: input.description,
            type: input.type ?? "text",
            language: input.language ?? "pt-BR",
            contributor: input.contributor,
            forDevelopers: input.forDevelopers ?? false,
            favorite: input.favorite ?? false,
            archived: input.archived ?? false,
            categoryId: input.categoryId,
            subcategoryId: input.subcategoryId,
            contentHash: createPromptHash(input.title, input.content)
          })
          .returning();
        if (!prompt) throw new AppError("DATABASE_ERROR", 500, "Prompt não pôde ser criado");
        const promptTagValues = await resolveTags(tx, input.tags ?? []);
        if (promptTagValues.length > 0) await tx.insert(promptTags).values(promptTagValues.map((tag) => ({ promptId: prompt.id, tagId: tag.id })));
        return prompt;
      });
    },
    async list(filters: PromptFilters) {
      return repository.list(filters);
    },
    async getById(id: string) {
      const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
      if (!prompt) throw new AppError("NOT_FOUND", 404, "Prompt não encontrado");
      return prompt;
    },
    async update(id: string, input: Partial<PromptInput>) {
      const current = await this.getById(id);
      const merged: PromptInput = {
        title: input.title ?? current.title,
        content: input.content ?? current.content,
        originalTitle: input.originalTitle ?? current.originalTitle ?? undefined,
        originalContent: input.originalContent ?? current.originalContent ?? undefined,
        description: input.description ?? current.description ?? undefined,
        type: input.type ?? current.type,
        language: input.language ?? current.language,
        contributor: input.contributor ?? current.contributor ?? undefined,
        forDevelopers: input.forDevelopers ?? current.forDevelopers,
        favorite: input.favorite ?? current.favorite,
        archived: input.archived ?? current.archived,
        categoryId: input.categoryId ?? current.categoryId ?? undefined,
        subcategoryId: input.subcategoryId ?? current.subcategoryId ?? undefined,
        tags: input.tags
      };
      await validateTaxonomy(db, merged);
      const [prompt] = await db
        .update(prompts)
        .set({
          title: merged.title,
          content: merged.content,
          originalTitle: merged.originalTitle,
          originalContent: merged.originalContent,
          description: merged.description,
          type: merged.type,
          language: merged.language,
          contributor: merged.contributor,
          forDevelopers: merged.forDevelopers,
          favorite: merged.favorite,
          archived: merged.archived,
          categoryId: merged.categoryId,
          subcategoryId: merged.subcategoryId,
          contentHash: createPromptHash(merged.title, merged.content),
          updatedAt: new Date()
        })
        .where(eq(prompts.id, id))
        .returning();
      if (input.tags !== undefined) {
        await db.delete(promptTags).where(eq(promptTags.promptId, id));
        const promptTagValues = await resolveTags(db, input.tags);
        if (promptTagValues.length > 0) {
          await db.insert(promptTags).values(promptTagValues.map((tag) => ({ promptId: id, tagId: tag.id })));
        }
      }
      return prompt;
    },
    async remove(id: string) {
      const deleted = await db.delete(prompts).where(eq(prompts.id, id)).returning({ id: prompts.id });
      if (deleted.length === 0) throw new AppError("NOT_FOUND", 404, "Prompt não encontrado");
    },
    async duplicate(id: string) {
      const source = await this.getById(id);
      let title = `Cópia de ${source.title}`;
      let attempt = 2;
      while ((await db.select({ id: prompts.id }).from(prompts).where(eq(prompts.contentHash, createPromptHash(title, source.content)))).length > 0) {
        title = `Cópia ${attempt} de ${source.title}`;
        attempt += 1;
      }
      return this.create({ title, content: source.content, originalTitle: source.originalTitle ?? undefined, originalContent: source.originalContent ?? undefined, description: source.description ?? undefined, type: source.type, language: source.language, contributor: source.contributor ?? undefined, forDevelopers: source.forDevelopers, favorite: source.favorite, archived: source.archived, categoryId: source.categoryId ?? undefined, subcategoryId: source.subcategoryId ?? undefined });
    }
  };
}
