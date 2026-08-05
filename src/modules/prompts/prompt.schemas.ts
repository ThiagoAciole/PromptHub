import { Type } from "@sinclair/typebox";

export const promptBody = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  content: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  type: Type.Optional(Type.String({ maxLength: 50 })),
  language: Type.Optional(Type.String({ maxLength: 20 })),
  contributor: Type.Optional(Type.String({ maxLength: 120 })),
  forDevelopers: Type.Optional(Type.Boolean()),
  favorite: Type.Optional(Type.Boolean()),
  archived: Type.Optional(Type.Boolean()),
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
  subcategoryId: Type.Optional(Type.String({ format: "uuid" })),
  tags: Type.Optional(Type.Array(Type.String({ minLength: 1 })))
});

export const promptParams = Type.Object({ id: Type.String({ format: "uuid" }) });
