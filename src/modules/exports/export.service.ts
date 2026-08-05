import type { Database } from "../../database/client.js";
import { createPromptRepository } from "../prompts/prompt.repository.js";
import type { PromptFilters } from "../prompts/prompt.types.js";

export interface PromptExportRow {
  id: string;
  title: string;
  content: string;
  description: string | null;
  type: string;
  language: string;
  contributor: string | null;
  forDevelopers: boolean;
  favorite: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function exportPrompts(db: Database, filters: PromptFilters): Promise<PromptExportRow[]> {
  const result = await createPromptRepository(db).list({ ...filters, page: 1, limit: 100 });
  return result.rows;
}

function csvValue(value: unknown): string {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function serializeCsv(rows: PromptExportRow[]): string {
  const headers = ["id", "title", "content", "description", "type", "language", "contributor", "for_developers", "favorite", "archived", "created_at", "updated_at"];
  const lines = rows.map((row) => [row.id, row.title, row.content, row.description, row.type, row.language, row.contributor, row.forDevelopers, row.favorite, row.archived, row.createdAt, row.updatedAt].map(csvValue).join(","));
  return [headers.join(","), ...lines].join("\n") + "\n";
}
