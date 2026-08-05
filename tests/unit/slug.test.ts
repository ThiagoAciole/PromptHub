import { describe, expect, it } from "vitest";
import { normalizeSlug } from "../../src/shared/slug/normalize-slug.js";

describe("normalizeSlug", () => {
  it("normalizes accents, spaces and punctuation", () => {
    expect(normalizeSlug("  Categoría de IA & Dados  ")).toBe("categoria-de-ia-dados");
  });

  it("collapses repeated separators and removes edge hyphens", () => {
    expect(normalizeSlug("--- Prompt /// para ___ testes ---")).toBe("prompt-para-testes");
  });
});
