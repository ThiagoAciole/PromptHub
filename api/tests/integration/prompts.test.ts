import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadEnv } from "../../src/config/env.js";

const databaseUrl = process.env.DATABASE_URL?.trim();
const integration = describe.skipIf(!databaseUrl);
let app: Awaited<ReturnType<typeof buildApp>> | undefined;

integration("prompts HTTP API", () => {
  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it("creates, reads, updates, lists and removes a prompt", async () => {
    const config = loadEnv({
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl!
    });
    app = buildApp({ config, databaseUrl: databaseUrl!, logger: false });
    await app.ready();

    const createdResponse = await app.inject({
      method: "POST",
      url: "/api/v1/prompts",
      payload: {
        title: "  Prompt de integração ",
        content: "Conteúdo do prompt de integração",
        type: "text",
        category: "testes"
      }
    });
    expect(createdResponse.statusCode).toBe(201);
    const created = createdResponse.json<{ id: string; title: string }>();
    expect(created.title).toBe("Prompt de integração");

    const fetchedResponse = await app.inject({ method: "GET", url: `/api/v1/prompts/${created.id}` });
    expect(fetchedResponse.statusCode).toBe(200);
    expect(fetchedResponse.json()).toMatchObject({ id: created.id, title: "Prompt de integração" });

    const patchedResponse = await app.inject({
      method: "PATCH",
      url: `/api/v1/prompts/${created.id}`,
      payload: { content: "Conteúdo atualizado" }
    });
    expect(patchedResponse.statusCode).toBe(200);
    expect(patchedResponse.json()).toMatchObject({ id: created.id, content: "Conteúdo atualizado" });

    const listedResponse = await app.inject({ method: "GET", url: "/api/v1/prompts?search=atualizado" });
    expect(listedResponse.statusCode).toBe(200);
    expect(listedResponse.json<{ data: Array<{ id: string }> }>().data.some((prompt) => prompt.id === created.id)).toBe(true);

    const deletedResponse = await app.inject({ method: "DELETE", url: `/api/v1/prompts/${created.id}` });
    expect(deletedResponse.statusCode).toBe(204);
  });

  it("removes selected prompts and clears the remaining catalog only after confirmation", async () => {
    const config = loadEnv({
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl!
    });
    app = buildApp({ config, databaseUrl: databaseUrl!, logger: false });
    await app.ready();

    const createPrompt = async (title: string) => {
      const response = await app!.inject({
        method: "POST",
        url: "/api/v1/prompts",
        payload: { title, content: `Conteúdo de ${title}`, type: "text" }
      });
      expect(response.statusCode).toBe(201);
      return response.json<{ id: string }>();
    };

    const first = await createPrompt("Prompt lote 1");
    const second = await createPrompt("Prompt lote 2");
    const third = await createPrompt("Prompt lote 3");

    const batchResponse = await app.inject({
      method: "DELETE",
      url: "/api/v1/prompts/batch",
      payload: { ids: [first.id, second.id] }
    });
    expect(batchResponse.statusCode).toBe(200);
    expect(batchResponse.json()).toEqual({ deletedCount: 2 });

    const invalidClearResponse = await app.inject({
      method: "DELETE",
      url: "/api/v1/prompts",
      payload: { confirm: "delete all" }
    });
    expect(invalidClearResponse.statusCode).toBe(400);

    const clearResponse = await app.inject({
      method: "DELETE",
      url: "/api/v1/prompts",
      payload: { confirm: "DELETE_ALL_PROMPTS" }
    });
    expect(clearResponse.statusCode).toBe(200);
    expect(clearResponse.json()).toEqual({ deletedCount: 1 });

    const fetchedResponse = await app.inject({ method: "GET", url: `/api/v1/prompts/${third.id}` });
    expect(fetchedResponse.statusCode).toBe(404);
  });
});
