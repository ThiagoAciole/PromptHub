import { relations } from "drizzle-orm";
import { categories, promptTags, prompts, subcategories, tags } from "./schema/index.js";

export const categoriesRelations = relations(categories, ({ many }) => ({
  prompts: many(prompts),
  subcategories: many(subcategories)
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id]
  }),
  prompts: many(prompts)
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  category: one(categories, {
    fields: [prompts.categoryId],
    references: [categories.id]
  }),
  subcategory: one(subcategories, {
    fields: [prompts.subcategoryId],
    references: [subcategories.id]
  }),
  promptTags: many(promptTags)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  promptTags: many(promptTags)
}));

export const promptTagsRelations = relations(promptTags, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptTags.promptId],
    references: [prompts.id]
  }),
  tag: one(tags, {
    fields: [promptTags.tagId],
    references: [tags.id]
  })
}));
