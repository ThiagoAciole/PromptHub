import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { describe, expect, it, vi } from "vitest";
import { PromptCard } from "./PromptCard";
import type { Prompt } from "../../lib/api.types";

const prompt: Prompt = { id: "1", title: "React helper", content: "Use this prompt", description: "A useful helper", type: "coding", language: "pt-BR", contributor: "Thiago", forDevelopers: true, favorite: false, archived: false, category: "Frontend", subcategory: "React", tags: ["react", "typescript"], createdAt: "2026-01-01", updatedAt: "2026-01-01" };

describe("PromptCard", () => {
  it("shows prompt metadata and exposes actions", () => {
    render(<MantineProvider><PromptCard prompt={prompt} onOpen={vi.fn()} onToggleFavorite={vi.fn()} onCopy={vi.fn()} /></MantineProvider>);
    expect(screen.getByText("React helper")).toBeTruthy();
    expect(screen.getByText("Use this prompt")).toBeTruthy();
    expect(screen.getByText("react")).toBeTruthy();
    expect(screen.getByRole("button", { name: /favoritar/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /copiar/i })).toBeTruthy();
  });
});
