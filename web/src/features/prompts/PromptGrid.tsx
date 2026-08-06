import { SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import type { Prompt } from "../../lib/api.types";
import { PromptCard } from "./PromptCard";

interface PromptGridProps { prompts: Prompt[]; loading?: boolean; onOpen: (prompt: Prompt) => void; onToggleFavorite: (prompt: Prompt) => void; onCopy: (prompt: Prompt) => void }
export function PromptGrid({ prompts, loading, onOpen, onToggleFavorite, onCopy }: PromptGridProps) {
  if (loading) return <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} height={220} radius="md" />)}</SimpleGrid>;
  if (prompts.length === 0) return <Stack align="center" py="xl"><Text c="dimmed">Nenhum prompt encontrado.</Text></Stack>;
  return <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>{prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} onOpen={onOpen} onToggleFavorite={onToggleFavorite} onCopy={onCopy} />)}</SimpleGrid>;
}
