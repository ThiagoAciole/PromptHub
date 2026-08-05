import type { CsvRow, ImportRowError, PromptImportInput } from "./import.types.js";

export type TransformResult = { ok: true; value: PromptImportInput } | { ok: false; error: ImportRowError };

export function transformCsvRow(row: CsvRow, rowNumber: number): TransformResult {
  const title = row.act?.trim() ?? "";
  const content = row.prompt?.trim() ?? "";
  if (!title || !content) return { ok: false, error: { row: rowNumber, message: "act e prompt são obrigatórios" } };

  const rawBoolean = row.for_devs?.trim().toLowerCase();
  if (rawBoolean && !["true", "false", "1", "0", "yes", "no"].includes(rawBoolean)) {
    return { ok: false, error: { row: rowNumber, message: "for_devs deve ser booleano" } };
  }

  return {
    ok: true,
    value: {
      title,
      content,
      type: row.type?.trim() || "TEXT",
      contributor: row.contributor?.trim() || undefined,
      forDevelopers: rawBoolean === "true" || rawBoolean === "1" || rawBoolean === "yes"
    }
  };
}
