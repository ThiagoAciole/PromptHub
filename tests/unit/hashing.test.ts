import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createPromptHash } from "../../src/shared/hashing/create-prompt-hash.js";

describe("createPromptHash", () => {
  it("creates the same hash for equivalent normalized input", () => {
    expect(createPromptHash(" Meu título ", "Conteúdo  com\n espaços ")).toBe(
      "8b68ecb68cef4ecd2161371ced07b8153a9eaf9bf8c716e3c9b054ce43d00a88"
    );
  });

  it("ignores casing differences in titles", () => {
    expect(createPromptHash("Meu Título", "Conteúdo")).toBe(createPromptHash("meu título", "Conteúdo"));
  });

  it("preserves casing differences in content", () => {
    expect(createPromptHash("Meu Título", "Conteúdo")).not.toBe(createPromptHash("Meu Título", "conteúdo"));
  });

  it("includes the colon separator in the hashed input", () => {
    const expected = createHash("sha256").update("meu:título:Conteúdo", "utf8").digest("hex");

    expect(createPromptHash("Meu:Título", "Conteúdo")).toBe(expected);
  });
});
