export type ImportError = { row: number; fields: string[]; message: string };
export type ImportSummary = { imported: number; rejected: number; errors: ImportError[] };
