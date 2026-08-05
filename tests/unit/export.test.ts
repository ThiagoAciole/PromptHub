import { describe, expect, it } from "vitest";
import { serializeCsv, type PromptExportRow } from "../../src/modules/exports/export.service.js";

describe("serializeCsv", () => {
  it("escapes commas and quotes in prompt content", () => {
    const row: PromptExportRow = {
      id: "1", title: "Título, teste", content: 'texto "especial"', originalTitle: null, originalContent: null, description: null, type: "text", language: "pt-BR",
      contributor: null, forDevelopers: false, favorite: false, archived: false, category: null, subcategory: null, tags: ["teste"], createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01")
    };
    expect(serializeCsv([row])).toContain('"Título, teste"');
    expect(serializeCsv([row])).toContain('"texto ""especial"""');
  });
});
