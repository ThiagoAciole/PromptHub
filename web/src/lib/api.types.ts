export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string | null;
  type: string;
  language: string;
  contributor: string | null;
  forDevelopers: boolean;
  favorite: boolean;
  archived: boolean;
  category: string | null;
  subcategory: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaxonomyItem { id: string; name: string; slug: string; promptCount?: number }
export interface PromptQuery { search?: string; categoryId?: string; subcategoryId?: string; tag?: string; language?: string; type?: string; favorite?: boolean; archived?: boolean; page: number; limit: number; sort: "title" | "createdAt" | "updatedAt"; order: "asc" | "desc" }
export interface PromptPage { data: Prompt[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
