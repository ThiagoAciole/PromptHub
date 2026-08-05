import { describe, expect, it } from "vitest";
import { AppError } from "../../src/shared/errors/app-error.js";
import { errorCodes } from "../../src/shared/errors/error-codes.js";

describe("AppError", () => {
  it("exposes the typed error contract and shared codes", () => {
    const details = { field: "title" };
    const error = new AppError(errorCodes.validation, 400, "Título inválido", details);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Título inválido");
    expect(error.details).toBe(details);
    expect(errorCodes.promptAlreadyExists).toBe("PROMPT_ALREADY_EXISTS");
  });
});
