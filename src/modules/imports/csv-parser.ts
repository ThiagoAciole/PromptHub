import { parse } from "csv-parse";
import type { Readable } from "node:stream";
import type { CsvRow } from "./import.types.js";

export async function* parseCsv(input: NodeJS.ReadableStream): AsyncGenerator<{ rowNumber: number; row: CsvRow }> {
  const parser = parse({ columns: true, bom: true, skip_empty_lines: true, relax_quotes: true, trim: true });
  (input as Readable).pipe(parser);
  let rowNumber = 1;
  for await (const row of parser) {
    yield { rowNumber: rowNumber + 1, row: row as CsvRow };
    rowNumber += 1;
  }
}
