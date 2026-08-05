import "dotenv/config";

export type NodeEnvironment = "development" | "test" | "production";
export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";

export interface AppConfig {
  nodeEnv: NodeEnvironment;
  host: string;
  port: number;
  databaseUrl: string;
  corsOrigins: string[];
  maxUploadSizeMb: number;
  logLevel: LogLevel;
}

const nodeEnvironments = new Set<NodeEnvironment>(["development", "test", "production"]);
const logLevels = new Set<LogLevel>(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);

function required(source: NodeJS.ProcessEnv, name: string): string {
  const value = source[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function positiveNumber(source: NodeJS.ProcessEnv, name: string, fallback: string): number {
  const raw = source[name]?.trim() || fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
    throw new Error(`Variável de ambiente inválida: ${name} deve ser um inteiro positivo`);
  }
  return value;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = (source.NODE_ENV?.trim() || "development") as NodeEnvironment;
  if (!nodeEnvironments.has(nodeEnv)) {
    throw new Error("Variável de ambiente inválida: NODE_ENV deve ser development, test ou production");
  }

  const logLevel = (source.LOG_LEVEL?.trim() || "info") as LogLevel;
  if (!logLevels.has(logLevel)) {
    throw new Error(`Variável de ambiente inválida: LOG_LEVEL=${logLevel}`);
  }

  const corsOrigins = (source.CORS_ORIGINS?.trim() || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    nodeEnv,
    host: source.HOST?.trim() || "0.0.0.0",
    port: positiveNumber(source, "PORT", "3333"),
    databaseUrl: required(source, "DATABASE_URL"),
    corsOrigins,
    maxUploadSizeMb: positiveNumber(source, "MAX_UPLOAD_SIZE_MB", "10"),
    logLevel
  };
}
