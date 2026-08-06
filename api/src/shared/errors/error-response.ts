import { AppError } from "./app-error.js";

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    details: unknown;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function toErrorResponse(error: unknown, production: boolean): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details ?? null
      }
    };
  }

  if (isRecord(error) && error.code === "23505" && error.constraint === "prompts_content_hash_unique") {
    return {
      error: {
        code: "PROMPT_ALREADY_EXISTS",
        message: "Já existe um prompt com o mesmo conteúdo",
        statusCode: 409,
        details: null
      }
    };
  }

  if (isRecord(error) && error.code === "23505") {
    return {
      error: {
        code: "CONFLICT",
        message: "Já existe um registro com os mesmos dados únicos",
        statusCode: 409,
        details: null
      }
    };
  }

  if (isRecord(error) && "validation" in error) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "A requisição é inválida",
        statusCode: 400,
        details: error.validation ?? null
      }
    };
  }

  const message = !production && error instanceof Error ? error.message : "Erro interno do servidor";
  return {
    error: {
      code: "INTERNAL_ERROR",
      message,
      statusCode: 500,
      details: null
    }
  };
}
