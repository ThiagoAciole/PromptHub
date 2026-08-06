import type { Readable } from "node:stream";
import { createPromptService } from "../prompts/prompt.service.js";
import type { Database } from "../../database/client.js";
import { parseCsv } from "./csv-parser.js";
import type { ImportError, ImportSummary } from "./import.types.js";

const parseBoolean = (value: string | undefined) => value?.trim().toLowerCase() === "true";

export function parsePromptCsvRow(value: Record<string, string>) {
  return {
    title: value.title?.trim() ?? "",
    description: value.description?.trim() || null,
    content: value.content?.trim() ?? "",
    type: value.type?.trim() ?? "",
    category: value.category?.trim() || null,
    tags: (value.tags ?? "").split(";").map((tag) => tag.trim()).filter(Boolean),
    isFavorite: parseBoolean(value.is_favorite),
    isArchived: parseBoolean(value.is_archived)
  };
}

export async function importCsv(stream: Readable, db: Database): Promise<ImportSummary> {
  const service = createPromptService(db);
  const errors: ImportError[] = [];
  let imported = 0;

  for (const { row, value } of await parseCsv(stream)) {
    const input = parsePromptCsvRow(value);
    const fields = ["title", "content", "type"].filter((field) => !input[field as keyof typeof input]);
    if (fields.length > 0) {
      errors.push({ row, fields, message: `${fields.join(" e ")} é obrigatório` });
      continue;
    }

    await service.create(input);
    imported++;
  }

  return { imported, rejected: errors.length, errors };
}
