import { useCallback, useEffect, useMemo, useState } from "react";
import { listCategories, listPrompts, listSubcategories, listTags, updatePrompt } from "../../lib/api";
import type { Prompt, PromptPage, TaxonomyItem } from "../../lib/api.types";
import type { CatalogFilters } from "./catalog.types";

const defaults: CatalogFilters = { search: "", page: 1, limit: 24, sort: "updatedAt", order: "desc" };
const readFilters = (): CatalogFilters => { const params = new URLSearchParams(window.location.search); return { ...defaults, search: params.get("search") ?? "", categoryId: params.get("categoryId") ?? undefined, subcategoryId: params.get("subcategoryId") ?? undefined, tag: params.get("tag") ?? undefined, language: params.get("language") ?? undefined, type: params.get("type") ?? undefined, favorite: params.get("favorite") === "true" ? true : undefined, page: Number(params.get("page") || 1) };
};

export function usePromptCatalog() {
  const [filters, setFilters] = useState<CatalogFilters>(readFilters);
  const [query, setQuery] = useState(filters);
  const [page, setPage] = useState<PromptPage>({ data: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } });
  const [taxonomy, setTaxonomy] = useState<{ categories: TaxonomyItem[]; subcategories: TaxonomyItem[]; tags: TaxonomyItem[] }>({ categories: [], subcategories: [], tags: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { const timeout = window.setTimeout(() => setQuery(filters), 300); return () => window.clearTimeout(timeout); }, [filters]);
  useEffect(() => { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => value !== undefined && value !== "" && params.set(key, String(value))); window.history.replaceState(null, "", `${window.location.pathname}?${params}`); }, [query]);
  useEffect(() => { let active = true; setLoading(true); setError(null); Promise.all([listPrompts(query), listCategories(), listSubcategories(), listTags()]).then(([result, categories, subcategories, tags]) => { if (!active) return; setPage(result); setTaxonomy({ categories, subcategories, tags }); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o catálogo."); }).finally(() => active && setLoading(false)); return () => { active = false; }; }, [query]);
  const changeFilters = useCallback((next: Partial<CatalogFilters>) => setFilters((current) => ({ ...current, ...next, page: next.page ?? 1 })), []);
  const toggleFavorite = useCallback(async (prompt: Prompt) => { const updated = await updatePrompt(prompt.id, { favorite: !prompt.favorite }); setPage((current) => ({ ...current, data: current.data.map((item) => item.id === updated.id ? { ...item, favorite: updated.favorite } : item) })); }, []);
  const copyPrompt = useCallback(async (prompt: Prompt) => { await navigator.clipboard.writeText(prompt.content); }, []);
  return useMemo(() => ({ filters, changeFilters, page, taxonomy, loading, error, retry: () => setQuery({ ...filters }), toggleFavorite, copyPrompt }), [filters, changeFilters, page, taxonomy, loading, error, toggleFavorite, copyPrompt]);
}
