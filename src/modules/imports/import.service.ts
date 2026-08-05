import { createPromptService } from "../prompts/prompt.service.js";
import { parseCsv } from "./csv-parser.js";
import { transformCsvRow } from "./csv-transformer.js";
import type { ImportOptions, ImportSummary } from "./import.types.js";

export async function importCsv(input: NodeJS.ReadableStream, options: ImportOptions): Promise<ImportSummary> {
  const summary: ImportSummary = { received: 0, created: 0, duplicated: 0, ignored: 0, failed: 0, errors: [], totalErrors: 0 };
  const maxErrors = options.maxErrors ?? 50;
  const service = createPromptService(options.db);

  for await (const { rowNumber, row } of parseCsv(input)) {
    summary.received += 1;
    const transformed = transformCsvRow(row, rowNumber);
    if (!transformed.ok) {
      summary.failed += 1;
      summary.totalErrors += 1;
      if (summary.errors.length < maxErrors) summary.errors.push(transformed.error);
      continue;
    }
    try {
      await service.create(transformed.value);
      summary.created += 1;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "23505") {
        summary.duplicated += 1;
      } else {
        summary.failed += 1;
        summary.totalErrors += 1;
        if (summary.errors.length < maxErrors) summary.errors.push({ row: rowNumber, message: "falha ao importar linha" });
      }
    }
  }
  summary.ignored = summary.received - summary.created - summary.duplicated - summary.failed;
  return summary;
}
