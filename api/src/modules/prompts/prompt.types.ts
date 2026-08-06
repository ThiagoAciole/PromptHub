export type PromptInput = {
  title: string;
  description?: string | null;
  content: string;
  type: string;
  category?: string | null;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
};

export type PromptPatch = Partial<PromptInput>;

export type PreparedPromptCreate = {
  title: string;
  description: string | null;
  content: string;
  type: string;
  category: string | null;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  contentHash: string;
};

export type PreparedPromptPatch = Partial<PreparedPromptCreate>;

export type PromptRecord = PreparedPromptCreate & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PromptSort = "title" | "createdAt" | "updatedAt";
export type PromptOrder = "asc" | "desc";

export type PromptListQueryInput = {
  search?: string;
  category?: string;
  tag?: string;
  type?: string;
  favorite?: boolean | string;
  archived?: boolean | string;
  page?: number | string;
  limit?: number | string;
  sort?: PromptSort | string;
  order?: PromptOrder | string;
};

export type PromptListQuery = {
  search?: string;
  category?: string;
  tag?: string;
  type?: string;
  favorite?: boolean;
  archived?: boolean;
  page: number;
  limit: number;
  sort: PromptSort;
  order: PromptOrder;
};

export type PromptListResponse = {
  data: PromptRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
