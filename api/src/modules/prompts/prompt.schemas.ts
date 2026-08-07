import { Type } from "@sinclair/typebox";

export const promptBody = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  content: Type.String({ minLength: 1 }),
  type: Type.String({ minLength: 1, maxLength: 80 }),
  category: Type.Optional(Type.Union([Type.String({ maxLength: 120 }), Type.Null()])),
  tags: Type.Optional(Type.Array(Type.String({ minLength: 1, maxLength: 80 }), { maxItems: 100 })),
  isFavorite: Type.Optional(Type.Boolean()),
  isArchived: Type.Optional(Type.Boolean())
});

export const promptListQuery = Type.Object({
  search: Type.Optional(Type.String()),
  category: Type.Optional(Type.String({ maxLength: 120 })),
  tag: Type.Optional(Type.String({ maxLength: 80 })),
  type: Type.Optional(Type.String({ maxLength: 80 })),
  favorite: Type.Optional(Type.Boolean()),
  archived: Type.Optional(Type.Boolean()),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  sort: Type.Optional(Type.Union([Type.Literal("title"), Type.Literal("createdAt"), Type.Literal("updatedAt")])),
  order: Type.Optional(Type.Union([Type.Literal("asc"), Type.Literal("desc")]))
});

export const promptParams = Type.Object({ id: Type.String({ format: "uuid" }) });

export const promptBulkDeleteBody = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), { minItems: 1, maxItems: 1000 })
});

export const promptDeleteAllBody = Type.Object({
  confirm: Type.Literal("DELETE_ALL_PROMPTS")
});
