import { describe, expect, it } from "vitest";
import { transformCsvRow } from "../../src/modules/imports/csv-transformer.js";

describe("transformCsvRow", () => {
  it("maps the CSV developer flag", () => {
    expect(transformCsvRow({ act: "Título", prompt: "Conteúdo", for_devs: "TRUE" }, 2)).toEqual({
      ok: true,
      value: { title: "Título", content: "Conteúdo", type: "TEXT", forDevelopers: true, tags: ["desenvolvimento"] }
    });
  });

  it("reports missing required columns", () => {
    expect(transformCsvRow({ act: "" }, 4)).toEqual({ ok: false, error: { row: 4, message: "act e prompt são obrigatórios" } });
  });
});
