import { describe, expect, it } from "vitest";
import * as promptService from "../../src/modules/prompts/prompt.service.js";

type PromptServiceExports = Record<string, unknown>;

const serviceExports = promptService as PromptServiceExports;

describe("prompt contract", () => {
  it("normalizes prompt fields and derives a stable content hash on create", () => {
    const prepare = serviceExports.preparePromptCreate;
    expect(prepare).toBeTypeOf("function");
    if (typeof prepare !== "function") return;

    expect(prepare({
      title: "  Meu   Prompt ",
      description: "   ",
      content: "  Faça   algo  ",
      type: "  chat  ",
      category: "  produtividade ",
      tags: [" React ", "react", "  API"],
      isFavorite: true
    })).toEqual({
      title: "Meu   Prompt",
      description: null,
      content: "Faça   algo",
      type: "chat",
      category: "produtividade",
      tags: ["react", "api"],
      isFavorite: true,
      isArchived: false,
      contentHash: "8527b7740294b575cdd36403e80035509fba9c92d82f7e2a19d45881425b37ff"
    });
  });

  it("rebuilds the content hash when a patch changes title or content", () => {
    const prepare = serviceExports.preparePromptPatch;
    expect(prepare).toBeTypeOf("function");
    if (typeof prepare !== "function") return;

    expect(prepare({ content: " Conteúdo novo " }, {
      id: "15236f76-da2b-4b4c-b7cf-8b3c91096a21",
      title: "Prompt atual",
      description: null,
      content: "Conteúdo atual",
      type: "chat",
      category: null,
      tags: [],
      isFavorite: false,
      isArchived: false,
      contentHash: "old",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z")
    })).toEqual({
      content: "Conteúdo novo",
      contentHash: "53a452f40e1947d5b2e665c048c4383fac93d1274392256e99eefd6b2de45f40"
    });
  });

  it("applies defaults and bounds to prompt list queries", () => {
    const normalize = serviceExports.normalizePromptListQuery;
    expect(normalize).toBeTypeOf("function");
    if (typeof normalize !== "function") return;

    expect(normalize({
      search: "  hello  ",
      category: "  work ",
      tag: "  React ",
      type: "  chat ",
      favorite: "true",
      archived: "false",
      page: "0",
      limit: "101",
      sort: "updatedAt",
      order: "asc"
    })).toEqual({
      search: "hello",
      category: "work",
      tag: "react",
      type: "chat",
      favorite: true,
      archived: false,
      page: 1,
      limit: 100,
      sort: "updatedAt",
      order: "asc"
    });
  });
});
