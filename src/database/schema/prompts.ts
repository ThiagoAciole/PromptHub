import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { categories } from "./categories.js";
import { subcategories } from "./subcategories.js";

export const prompts = pgTable(
  "prompts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    originalTitle: text("original_title"),
    originalContent: text("original_content"),
    description: text("description"),
    type: varchar("type", { length: 50 }).notNull().default("text"),
    language: varchar("language", { length: 20 }).notNull().default("pt-BR"),
    contributor: varchar("contributor", { length: 120 }),
    forDevelopers: boolean("for_developers").notNull().default(false),
    favorite: boolean("favorite").notNull().default(false),
    archived: boolean("archived").notNull().default(false),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    subcategoryId: uuid("subcategory_id").references(() => subcategories.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date())
  },
  (table) => [
    uniqueIndex("prompts_content_hash_unique").on(table.contentHash),
    index("prompts_category_id_idx").on(table.categoryId),
    index("prompts_subcategory_id_idx").on(table.subcategoryId),
    index("prompts_type_idx").on(table.type),
    index("prompts_language_idx").on(table.language),
    index("prompts_favorite_idx").on(table.favorite),
    index("prompts_archived_idx").on(table.archived),
    index("prompts_created_at_idx").on(table.createdAt),
    index("prompts_updated_at_idx").on(table.updatedAt)
  ]
);
