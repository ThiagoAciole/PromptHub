import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
export function PromptSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <TextInput aria-label="Buscar prompts" placeholder="Buscar prompts..." leftSection={<IconSearch size={16} />} value={value} onChange={(event) => onChange(event.currentTarget.value)} />; }
