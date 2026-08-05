import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { describe, expect, it, vi } from "vitest";
import { PromptFilters } from "./PromptFilters";

describe("PromptFilters", () => {
  it("renders taxonomy and favorite filters", () => {
    render(<MantineProvider><PromptFilters value={{}} onChange={vi.fn()} categories={[{ id: "c1", name: "Frontend", slug: "frontend" }]} subcategories={[]} tags={[{ id: "t1", name: "React", slug: "react" }]} /></MantineProvider>);
    expect(screen.getAllByLabelText("Categoria")[0]).toBeTruthy();
    expect(screen.getAllByLabelText("Tag")[0]).toBeTruthy();
    expect(screen.getByLabelText(/somente favoritos/i)).toBeTruthy();
  });
});
