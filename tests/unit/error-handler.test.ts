import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { corsPlugin, type CorsPluginOptions } from "../../src/plugins/cors.js";
import { errorHandlerPlugin } from "../../src/plugins/error-handler.js";
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

  it("keeps taxonomy uniqueness conflicts generic", () => {
    expect(toErrorResponse({ code: "23505", constraint: "categories_slug_unique" }, true).error.code).toBe("CONFLICT");
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

  it("serializes not-found routes with the public error contract", async () => {
    const app = Fastify();
    await app.register(errorHandlerPlugin, { production: true });

    const response = await app.inject({ method: "GET", url: "/missing" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Rota não encontrada",
        statusCode: 404,
        details: null
      }
    });

    await app.close();
  });

  it("rejects an open CORS policy outside development", async () => {
    const app = Fastify();
    const options: CorsPluginOptions & { nodeEnv: "production" } = {
      origins: ["*"],
      nodeEnv: "production"
    };
    app.register(corsPlugin, options);

    await expect(app.ready()).rejects.toThrow("CORS_ORIGINS=* só é permitido em development");
    await app.close();
  });
});
