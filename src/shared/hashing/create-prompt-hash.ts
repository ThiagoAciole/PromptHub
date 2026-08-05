import { createHash } from "node:crypto";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function createPromptHash(title: string, content: string): string {
  const normalized = JSON.stringify([normalize(title), normalize(content)]);
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}
