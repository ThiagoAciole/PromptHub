import { describe, expect, it } from "vitest";
import { parsePromptCsvRow } from "../../src/modules/imports/import.service.js";

describe("parsePromptCsvRow", () => {
  it("converte uma linha com os campos fisicos da tabela prompts", () => {
    expect(parsePromptCsvRow({
      title: "  Terminal Linux  ",
      description: "",
      content: "  pwd  ",
      type: "TEXT",
      category: "",
      tags: "for-developers; contributor:f",
      is_favorite: "true",
      is_archived: "false"
    })).toEqual({
      title: "Terminal Linux",
      description: null,
      content: "pwd",
      type: "TEXT",
      category: null,
      tags: ["for-developers", "contributor:f"],
      isFavorite: true,
      isArchived: false
    });
  });
});
