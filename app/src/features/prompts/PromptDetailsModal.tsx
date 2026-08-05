import { Button, Code, Modal, Stack, Text } from "@mantine/core";
import type { Prompt } from "../../lib/api.types";
export function PromptDetailsModal({ prompt, opened, onClose, onCopy }: { prompt: Prompt | null; opened: boolean; onClose: () => void; onCopy: (prompt: Prompt) => void }) { return <Modal opened={opened} onClose={onClose} title={prompt?.title} size="xl">{prompt && <Stack><Text>{prompt.description}</Text><Code block>{prompt.content}</Code><Button onClick={() => onCopy(prompt)}>Copiar conteúdo</Button></Stack>}</Modal>; }
