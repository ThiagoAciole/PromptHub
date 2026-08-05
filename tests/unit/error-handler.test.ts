import { describe, expect, it } from "vitest";
import { AppError } from "../../src/shared/errors/app-error.js";
import { toErrorResponse } from "../../src/shared/errors/error-response.js";

describe("toErrorResponse", () => {
  it("serializes AppError using the public error contract", () => {
    expect(toErrorResponse(new AppError("NOT_FOUND", 404, "Prompt não encontrado", { id: "x" }), false)).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Prompt não encontrado",
        statusCode: 404,
        details: { id: "x" }
      }
    });
  });

  it("maps duplicate PostgreSQL errors", () => {
    expect(toErrorResponse({ code: "23505", constraint: "prompts_content_hash_unique" }, true).error.code).toBe(
      "PROMPT_ALREADY_EXISTS"
    );
  });

  it("hides internal details in production", () => {
    expect(toErrorResponse(new Error("database password"), true)).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "Erro interno do servidor",
        statusCode: 500,
        details: null
      }
    });
  });
});
