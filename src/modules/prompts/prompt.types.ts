export interface PromptInput {
  title: string;
  content: string;
  description?: string | undefined;
  type?: string | undefined;
  language?: string | undefined;
  contributor?: string | undefined;
  forDevelopers?: boolean | undefined;
  favorite?: boolean | undefined;
  archived?: boolean | undefined;
  categoryId?: string | undefined;
  subcategoryId?: string | undefined;
  tags?: string[] | undefined;
}

export interface PromptFilters {
  search?: string | undefined;
  categoryId?: string | undefined;
  subcategoryId?: string | undefined;
  language?: string | undefined;
  type?: string | undefined;
  favorite?: boolean | undefined;
  archived?: boolean | undefined;
  page: number;
  limit: number;
  sort: "title" | "createdAt" | "updatedAt";
  order: "asc" | "desc";
}
