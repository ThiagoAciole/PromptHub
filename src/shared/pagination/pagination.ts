export interface PaginationInput {
  page?: string | number;
  limit?: string | number;
  total: number;
}

export interface Pagination {
  page: number;
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
}

function positiveInteger(value: string | number | undefined, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePagination(input: PaginationInput): Pagination {
  const page = positiveInteger(input.page, 1);
  const limit = Math.min(positiveInteger(input.limit, 20), 100);
  const total = Math.max(0, Math.floor(input.total));

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit)
  };
}
