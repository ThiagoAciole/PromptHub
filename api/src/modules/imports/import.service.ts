import type { Readable } from "node:stream";
import { createPromptService } from "../prompts/prompt.service.js";
import type { Database } from "../../database/client.js";
import { parseCsv } from "./csv-parser.js";
import type { ImportError, ImportSummary } from "./import.types.js";
export async function importCsv(stream: Readable, db: Database): Promise<ImportSummary> { const service = createPromptService(db); const errors: ImportError[] = []; let imported = 0; for (const { row, value } of await parseCsv(stream)) { const fields = ["title", "prompt"].filter((field) => !value[field]?.trim()); if (fields.length) { errors.push({ row, fields, message: `${fields.join(" e ")} é obrigatório` }); continue; } await service.create({ categoria: value.categoria || null, title: value.title!, prompt: value.prompt! }); imported++; } return { imported, rejected: errors.length, errors }; }
