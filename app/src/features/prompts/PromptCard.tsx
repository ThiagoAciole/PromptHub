import { ActionIcon, Badge, Button, Card, Group, Stack, Text, Title, Tooltip } from "@mantine/core";
import { IconCopy, IconHeart, IconHeartFilled } from "@tabler/icons-react";
import type { Prompt } from "../../lib/api.types";

interface PromptCardProps { prompt: Prompt; onOpen: (prompt: Prompt) => void; onToggleFavorite: (prompt: Prompt) => void; onCopy: (prompt: Prompt) => void }

export function PromptCard({ prompt, onOpen, onToggleFavorite, onCopy }: PromptCardProps) {
  return <Card withBorder radius="md" padding="lg" shadow="sm" className="prompt-card">
    <Stack gap="sm" className="prompt-card-content">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Title order={3} size="h4" lineClamp={2}>{prompt.title}</Title>
        <Tooltip label={prompt.favorite ? "Desfavoritar" : "Favoritar"}>
          <ActionIcon aria-label={prompt.favorite ? "Desfavoritar" : "Favoritar"} variant="subtle" color={prompt.favorite ? "red" : "gray"} onClick={() => onToggleFavorite(prompt)}>
            {prompt.favorite ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
      <Text c="dimmed" size="sm" lineClamp={3} className="prompt-card-description">{prompt.description || prompt.content}</Text>
      <Group gap="xs">{prompt.category && <Badge variant="light">{prompt.category}</Badge>}{prompt.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</Group>
      <Group justify="space-between" mt="xs" className="prompt-card-actions"><Text size="sm" c="dimmed">{prompt.type}</Text><Group gap={4}><Button variant="subtle" size="compact-sm" onClick={() => onOpen(prompt)}>•••</Button><Button variant="subtle" size="compact-sm" leftSection={<IconCopy size={15} />} onClick={() => onCopy(prompt)} aria-label="Copiar prompt">Copiar</Button></Group></Group>
    </Stack>
  </Card>;
}
