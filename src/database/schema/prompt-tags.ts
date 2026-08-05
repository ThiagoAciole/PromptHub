import { index, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { prompts } from "./prompts.js";
import { tags } from "./tags.js";

export const promptTags = pgTable(
  "prompt_tags",
  {
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.promptId, table.tagId] }), index("prompt_tags_tag_id_idx").on(table.tagId)]
);
