import type { PromptFilterValues } from "./PromptFilters";
export interface CatalogFilters extends PromptFilterValues { search: string; page: number; limit: number; sort: "title" | "createdAt" | "updatedAt"; order: "asc" | "desc" }
