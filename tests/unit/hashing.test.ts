import { describe, expect, it } from "vitest";
import { createPromptHash } from "../../src/shared/hashing/create-prompt-hash.js";

describe("createPromptHash", () => {
  it("creates the same hash for equivalent normalized input", () => {
    expect(createPromptHash(" Meu título ", "Conteúdo  com\n espaços ")).toBe(
      "d36ba492dd992d97dc274e94940a5be311c9f413d3367db1db88edb99192f598"
    );
  });
});
