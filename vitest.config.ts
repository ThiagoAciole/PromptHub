import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"]
  }
});
