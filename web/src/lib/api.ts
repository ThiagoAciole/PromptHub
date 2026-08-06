import type { Prompt, PromptPage, PromptQuery, TaxonomyItem } from "./api.types";
import { buildQueryString } from "./query";

const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api/v1";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { headers: { "Content-Type": "application/json", ...init?.headers }, ...init });
  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;
    try { message = ((await response.json()) as { message?: string }).message ?? message; } catch { /* resposta sem JSON */ }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
}

export const listPrompts = async (query: PromptQuery) => {
  const page = await request<PromptPage>(`/prompts?${buildQueryString(query)}`);
  return { ...page, data: page.data.map((prompt) => ({ ...prompt, tags: prompt.tags ?? [], category: prompt.category ?? null, subcategory: prompt.subcategory ?? null })) };
};
export const listCategories = () => request<TaxonomyItem[]>("/categories");
export const listSubcategories = () => request<TaxonomyItem[]>("/subcategories");
export const listTags = () => request<TaxonomyItem[]>("/tags");
export const updatePrompt = (id: string, patch: Partial<Pick<Prompt, "favorite" | "archived">>) => request<Prompt>(`/prompts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
export interface ImportSummary { received: number; created: number; duplicated: number; ignored: number; failed: number; errors: Array<{ row: number; message: string }>; totalErrors: number }
export async function importCsv(file: File): Promise<ImportSummary> {
  const form = new FormData(); form.append("file", file);
  const response = await fetch(`${baseUrl}/imports/csv`, { method: "POST", body: form });
  if (!response.ok) { let message = `Erro HTTP ${response.status}`; try { message = ((await response.json()) as { message?: string }).message ?? message; } catch { /* resposta sem JSON */ } throw new ApiError(response.status, message); }
  return response.json() as Promise<ImportSummary>;
}
