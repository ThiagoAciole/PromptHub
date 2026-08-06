import { asc, eq, isNotNull } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { prompts } from "../../database/schema/prompts.js";
import type { PromptInput, PromptPatch } from "./prompt.types.js";
export function createPromptRepository(db: Database) { return {
  create: async (input: PromptInput) => (await db.insert(prompts).values(input).returning())[0],
  list: () => db.select().from(prompts).orderBy(asc(prompts.title)),
  get: async (id: string) => (await db.select().from(prompts).where(eq(prompts.id, id)))[0],
  update: async (id: string, input: PromptPatch) => (await db.update(prompts).set(input).where(eq(prompts.id, id)).returning())[0],
  remove: async (id: string) => (await db.delete(prompts).where(eq(prompts.id, id)).returning({ id: prompts.id }))[0],
  categories: async () => (await db.selectDistinct({ categoria: prompts.categoria }).from(prompts).where(isNotNull(prompts.categoria)).orderBy(asc(prompts.categoria))).map((row) => row.categoria)
}; }
