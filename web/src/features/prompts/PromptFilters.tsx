import { Checkbox, Select, Stack } from "@mantine/core";
import type { PromptQuery, TaxonomyItem } from "../../lib/api.types";

export type PromptFilterValues = Partial<Pick<PromptQuery, "categoryId" | "subcategoryId" | "tag" | "language" | "type" | "favorite">>;
interface PromptFiltersProps { value: PromptFilterValues; onChange: (value: PromptFilterValues) => void; categories: TaxonomyItem[]; subcategories: TaxonomyItem[]; tags: TaxonomyItem[] }

export function PromptFilters({ value, onChange, categories, subcategories, tags }: PromptFiltersProps) {
  const set = (key: keyof PromptFilterValues, next: string | boolean | null) => onChange({ ...value, [key]: next || undefined });
  return <Stack gap="sm">
    <Select label="Categoria" placeholder="Todas" clearable value={value.categoryId ?? null} onChange={(v) => set("categoryId", v)} data={categories.map((item) => ({ value: item.id, label: item.name }))} />
    <Select label="Subcategoria" placeholder="Todas" clearable value={value.subcategoryId ?? null} onChange={(v) => set("subcategoryId", v)} data={subcategories.map((item) => ({ value: item.id, label: item.name }))} />
    <Select label="Tag" placeholder="Todas" clearable value={value.tag ?? null} onChange={(v) => set("tag", v)} data={tags.map((item) => ({ value: item.slug, label: item.name }))} />
    <Select label="Tipo" placeholder="Todos" clearable value={value.type ?? null} onChange={(v) => set("type", v)} data={["coding", "writing", "research"].map((item) => ({ value: item, label: item }))} />
    <Select label="Idioma" placeholder="Todos" clearable value={value.language ?? null} onChange={(v) => set("language", v)} data={["pt-BR", "en", "es"].map((item) => ({ value: item, label: item }))} />
    <Checkbox label="Somente favoritos" checked={value.favorite === true} onChange={(event) => set("favorite", event.currentTarget.checked)} />
  </Stack>;
}
