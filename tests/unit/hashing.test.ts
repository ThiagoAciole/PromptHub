import { describe, expect, it } from "vitest";
import { createPromptHash } from "../../src/shared/hashing/create-prompt-hash.js";

describe("createPromptHash", () => {
  it("creates the same hash for equivalent normalized input", () => {
    expect(createPromptHash(" Meu título ", "Conteúdo  com\n espaços ")).toBe(
      createPromptHash("meu título", "Conteúdo com espaços")
    );
  });

  it("keeps title and content boundaries distinct", () => {
    expect(createPromptHash("ab:c", "d")).not.toBe(createPromptHash("ab", "c:d"));
  });
});
