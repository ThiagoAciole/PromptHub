import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  category: varchar("category", { length: 120 }),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  isFavorite: boolean("is_favorite").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  unique("prompts_content_hash_unique").on(table.contentHash),
  index("prompts_category_idx").on(table.category),
  index("prompts_tags_idx").using("gin", table.tags)
]);
