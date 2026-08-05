import { Alert, Group, Pagination, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { PromptDetailsModal } from "./features/prompts/PromptDetailsModal";
import { PromptFilters } from "./features/prompts/PromptFilters";
import { PromptGrid } from "./features/prompts/PromptGrid";
import { PromptSearch } from "./features/prompts/PromptSearch";
import type { Prompt } from "./lib/api.types";
import { usePromptCatalog } from "./features/prompts/usePromptCatalog";

export default function App() {
  const catalog = usePromptCatalog(); const [selected, setSelected] = useState<Prompt | null>(null);
  return <AppShell><Stack gap="xl"><Group justify="space-between"><div><Title order={1}>Prompt Hub</Title><Text c="dimmed">{catalog.page.pagination.total} prompts no catálogo</Text></div><PromptSearch value={catalog.filters.search} onChange={(search) => catalog.changeFilters({ search })} /></Group><PromptFilters value={catalog.filters} onChange={(value) => catalog.changeFilters(value)} categories={catalog.taxonomy.categories} subcategories={catalog.taxonomy.subcategories} tags={catalog.taxonomy.tags} />{catalog.error && <Alert color="red" title="Erro ao carregar" withCloseButton onClose={catalog.retry}>{catalog.error}</Alert>}<PromptGrid prompts={catalog.page.data} loading={catalog.loading} onOpen={setSelected} onToggleFavorite={(prompt) => void catalog.toggleFavorite(prompt)} onCopy={(prompt) => void catalog.copyPrompt(prompt)} /><Pagination total={catalog.page.pagination.totalPages} value={catalog.filters.page} onChange={(page) => catalog.changeFilters({ page })} /><PromptDetailsModal prompt={selected} opened={selected !== null} onClose={() => setSelected(null)} onCopy={(prompt) => void catalog.copyPrompt(prompt)} /></Stack></AppShell>;
}
