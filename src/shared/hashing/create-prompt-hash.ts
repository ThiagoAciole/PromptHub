import { createHash } from "node:crypto";

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeContent(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function createPromptHash(title: string, content: string): string {
  const normalized = `${normalizeTitle(title)}:${normalizeContent(content)}`;
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}
