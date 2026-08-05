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

export const listPrompts = (query: PromptQuery) => request<PromptPage>(`/prompts?${buildQueryString(query)}`);
export const listCategories = () => request<TaxonomyItem[]>("/categories");
export const listSubcategories = () => request<TaxonomyItem[]>("/subcategories");
export const listTags = () => request<TaxonomyItem[]>("/tags");
export const updatePrompt = (id: string, patch: Partial<Pick<Prompt, "favorite" | "archived">>) => request<Prompt>(`/prompts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
