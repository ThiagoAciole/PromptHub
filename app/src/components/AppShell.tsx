import { AppShell as MantineAppShell, Container, Group, Text } from "@mantine/core";
import type { ReactNode } from "react";
export function AppShell({ children }: { children: ReactNode }) { return <MantineAppShell header={{ height: 64 }}><MantineAppShell.Header><Container size="xl" h="100%"><Group h="100%" justify="space-between"><Text fw={700}>Prompt Hub</Text><Text size="sm" c="dimmed">Catálogo de prompts</Text></Group></Container></MantineAppShell.Header><MantineAppShell.Main><Container size="xl" py="xl">{children}</Container></MantineAppShell.Main></MantineAppShell>; }
