export const errorCodes = {
  internal: "INTERNAL_ERROR",
  validation: "VALIDATION_ERROR",
  notFound: "NOT_FOUND",
  conflict: "CONFLICT",
  database: "DATABASE_ERROR",
  promptAlreadyExists: "PROMPT_ALREADY_EXISTS"
} as const;

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];
