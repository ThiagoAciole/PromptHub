import { Center, Stack, Text, Title } from "@mantine/core";

export default function App() {
  return (
    <Center mih="100vh" p="xl">
      <Stack align="center" gap="xs">
        <Title order={1}>Prompt Hub</Title>
        <Text c="dimmed">Seu catálogo de prompts, organizado em um só lugar.</Text>
      </Stack>
    </Center>
  );
}
