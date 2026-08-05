import type { Database } from "../../database/client.js";

export interface CsvRow {
  act?: string;
  prompt?: string;
  for_devs?: string;
  type?: string;
  contributor?: string;
}

export interface PromptImportInput {
  title: string;
  content: string;
  type?: string | undefined;
  contributor?: string | undefined;
  forDevelopers?: boolean | undefined;
}

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportSummary {
  received: number;
  created: number;
  duplicated: number;
  ignored: number;
  failed: number;
  errors: ImportRowError[];
  totalErrors: number;
}

export interface ImportOptions {
  db: Database;
  maxErrors?: number;
}
