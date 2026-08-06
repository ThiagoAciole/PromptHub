import { parse } from "csv-parse";
import type { Readable } from "node:stream";
export async function parseCsv(stream: Readable): Promise<{ row: number; value: Record<string, string> }[]> { const rows: { row: number; value: Record<string, string> }[] = []; let row = 1; for await (const value of stream.pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))) rows.push({ row: ++row, value }); return rows; }
