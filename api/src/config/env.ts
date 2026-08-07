import { config } from "dotenv";
import { existsSync } from "node:fs";
import { isIP } from "node:net";
import { fileURLToPath } from "node:url";

export const localEnvPath = fileURLToPath(new URL("../../../.env.local", import.meta.url));

if (existsSync(localEnvPath)) {
  config({ path: localEnvPath });
}

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

export function validateDatabaseUrl(value: string): string {
  const trimmed = value.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Variável de ambiente inválida: DATABASE_URL deve ser uma URL PostgreSQL válida");
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error("Variável de ambiente inválida: DATABASE_URL deve ser uma URL PostgreSQL válida");
  }
  return trimmed;
}

function positiveNumber(source: NodeJS.ProcessEnv, name: string, fallback: string): number {
  const raw = source[name]?.trim() || fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
    throw new Error(`Variável de ambiente inválida: ${name} deve ser um inteiro positivo`);
  }
  return value;
}

function validateHost(value: string): string {
  const isHostname = /^(?=.{1,253}$)(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)*[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(
    value
  );
  if (isIP(value) === 0 && !isHostname) {
    throw new Error(`Variável de ambiente inválida: HOST=${value}`);
  }
  return value;
}

function validateCorsOrigins(source: NodeJS.ProcessEnv, nodeEnv: NodeEnvironment): string[] {
  const raw = source.CORS_ORIGINS?.trim() || "";
  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of origins) {
    if (origin === "*") {
      if (nodeEnv !== "development") {
        throw new Error("Variável de ambiente inválida: CORS_ORIGINS=* só é permitido em development");
      }
      continue;
    }

    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`Variável de ambiente inválida: CORS_ORIGINS contém uma origem inválida: ${origin}`);
    }

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error(`Variável de ambiente inválida: CORS_ORIGINS contém uma origem inválida: ${origin}`);
    }
  }

  return origins;
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

  return {
    nodeEnv,
    host: validateHost(source.HOST?.trim() || "0.0.0.0"),
    port: positiveNumber(source, "PORT", "3333"),
    databaseUrl: validateDatabaseUrl(required(source, "DATABASE_URL")),
    corsOrigins: validateCorsOrigins(source, nodeEnv),
    maxUploadSizeMb: positiveNumber(source, "MAX_UPLOAD_SIZE_MB", "10"),
    logLevel
  };
}
