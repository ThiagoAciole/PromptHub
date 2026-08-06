import { createHash } from "node:crypto";
import type { Database } from "../../database/client.js";
import { AppError } from "../../shared/errors/app-error.js";
import { createPromptRepository } from "./prompt.repository.js";
import type {
  PreparedPromptCreate,
  PreparedPromptPatch,
  PromptInput,
  PromptListQuery,
  PromptListQueryInput,
  PromptPatch,
  PromptRecord,
  PromptSort,
  PromptOrder
} from "./prompt.types.js";

const normalizeTitle = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
const normalizeContent = (value: string) => value.trim().replace(/\s+/g, " ");
const createPromptHash = (title: string, content: string) =>
  createHash("sha256").update(`${normalizeTitle(title)}:${normalizeContent(content)}`, "utf8").digest("hex");
const normalizeText = (value: string) => value.trim();
const normalizeNullableText = (value: string | null | undefined) => value?.trim() || null;
const normalizeTags = (tags: string[] | undefined) => [...new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))];

export function preparePromptCreate(input: PromptInput): PreparedPromptCreate {
  const title = normalizeText(input.title);
  const content = normalizeText(input.content);

  return {
    title,
    description: normalizeNullableText(input.description),
    content,
    type: normalizeText(input.type),
    category: normalizeNullableText(input.category),
    tags: normalizeTags(input.tags),
    isFavorite: input.isFavorite ?? false,
    isArchived: input.isArchived ?? false,
    contentHash: createPromptHash(title, content)
  };
}

export function preparePromptPatch(input: PromptPatch, current: PromptRecord): PreparedPromptPatch {
  const patch: PreparedPromptPatch = {};

  if (input.title !== undefined) patch.title = normalizeText(input.title);
  if (input.description !== undefined) patch.description = normalizeNullableText(input.description);
  if (input.content !== undefined) patch.content = normalizeText(input.content);
  if (input.type !== undefined) patch.type = normalizeText(input.type);
  if (input.category !== undefined) patch.category = normalizeNullableText(input.category);
  if (input.tags !== undefined) patch.tags = normalizeTags(input.tags);
  if (input.isFavorite !== undefined) patch.isFavorite = input.isFavorite;
  if (input.isArchived !== undefined) patch.isArchived = input.isArchived;

  if (input.title !== undefined || input.content !== undefined) {
    patch.contentHash = createPromptHash(patch.title ?? current.title, patch.content ?? current.content);
  }

  return patch;
}

const parseBoolean = (value: boolean | string | undefined) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.toLowerCase() === "true") return true;
  if (typeof value === "string" && value.toLowerCase() === "false") return false;
  return undefined;
};

const parseBoundedInteger = (value: number | string | undefined, fallback: number, minimum: number, maximum?: number) => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const integer = Math.trunc(parsed);
  return Math.max(minimum, maximum === undefined ? integer : Math.min(integer, maximum));
};

export function normalizePromptListQuery(input: PromptListQueryInput): PromptListQuery {
  const sort = input.sort === "title" || input.sort === "createdAt" || input.sort === "updatedAt" ? input.sort : "createdAt";
  const order = input.order === "asc" || input.order === "desc" ? input.order : "desc";
  const query: PromptListQuery = {
    page: parseBoundedInteger(input.page, 1, 1),
    limit: parseBoundedInteger(input.limit, 20, 1, 100),
    sort: sort as PromptSort,
    order: order as PromptOrder
  };

  for (const key of ["search", "category", "tag", "type"] as const) {
    const value = input[key]?.trim();
    if (value) query[key] = key === "tag" ? value.toLowerCase() : value;
  }

  const favorite = parseBoolean(input.favorite);
  const archived = parseBoolean(input.archived);
  if (favorite !== undefined) query.favorite = favorite;
  if (archived !== undefined) query.archived = archived;

  return query;
}

const normalize = <T extends { categoria?: string | null }>(input: T): T => ({ ...input, ...(input.categoria !== undefined ? { categoria: input.categoria?.trim() || null } : {}) });
export function createPromptService(db: Database) { const repository = createPromptRepository(db); const required = (input: Partial<PromptInput>) => { if (input.title !== undefined && !input.title.trim()) throw new AppError("VALIDATION_ERROR", 400, "title é obrigatório"); if (input.prompt !== undefined && !input.prompt.trim()) throw new AppError("VALIDATION_ERROR", 400, "prompt é obrigatório"); };
 return { create: async (input: PromptInput) => { required(input); return repository.create(normalize(input)); }, list: () => repository.list(), getById: async (id: string) => { const record = await repository.get(id); if (!record) throw new AppError("NOT_FOUND", 404, "Prompt não encontrado"); return record; }, update: async (id: string, input: PromptPatch) => { required(input); const record = await repository.update(id, normalize(input)); if (!record) throw new AppError("NOT_FOUND", 404, "Prompt não encontrado"); return record; }, remove: async (id: string) => { if (!await repository.remove(id)) throw new AppError("NOT_FOUND", 404, "Prompt não encontrado"); }, listCategories: () => repository.categories() }; }
