import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { localEnvPath } from "../../src/config/env.js";

describe("local environment file", () => {
  it("uses .env.local at the repository root", () => {
    expect(localEnvPath).toBe(fileURLToPath(new URL("../../../.env.local", import.meta.url)));
  });
});
