import { Center, Stack, Text, Title } from "@mantine/core";
export function PromptEmptyState() { return <Center py="xl"><Stack align="center"><Title order={3}>Nenhum prompt encontrado</Title><Text c="dimmed">Tente remover alguns filtros ou buscar por outro termo.</Text></Stack></Center>; }
