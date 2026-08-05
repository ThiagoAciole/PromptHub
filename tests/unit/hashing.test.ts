import { describe, expect, it } from "vitest";
import { createPromptHash } from "../../src/shared/hashing/create-prompt-hash.js";

describe("createPromptHash", () => {
  it("creates the same hash for equivalent normalized input", () => {
    expect(createPromptHash(" Meu título ", "Conteúdo  com\n espaços ")).toBe(
      "8b68ecb68cef4ecd2161371ced07b8153a9eaf9bf8c716e3c9b054ce43d00a88"
    );
  });
});
