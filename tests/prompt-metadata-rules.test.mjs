import assert from "node:assert/strict";
import test from "node:test";
import { classifyPrompt, isOperationalPrompt } from "../scripts/prompt-metadata-rules.mjs";
import { enrichRows, partitionOperationalRows } from "../scripts/enrich-prompt-metadata.mjs";

test("classifica instruções de terminal Linux como Tecnologia", () => {
  const metadata = classifyPrompt({
    title: "Terminal Linux",
    content: "Quero que você se comporte como um terminal Linux. Digitarei comandos e você responderá apenas com a saída do terminal."
  });

  assert.equal(metadata.category, "Tecnologia");
  assert.equal(metadata.description, "Simula um terminal Linux para executar comandos e retornar suas saídas.");
  assert.equal(metadata.tags.length, 5);
  assert.deepEqual(metadata.tags.slice(0, 3), ["linux", "terminal", "comandos"]);
});

test("classifica tarefas de React como Desenvolvimento", () => {
  const metadata = classifyPrompt({
    title: "Componente React",
    content: "Crie um componente React reutilizável em TypeScript, com props tipadas, acessibilidade e testes unitários."
  });

  assert.equal(metadata.category, "Desenvolvimento");
  assert.equal(metadata.tags.length, 5);
  assert.deepEqual(metadata.tags.slice(0, 4), ["react", "typescript", "componentes", "frontend"]);
});

test("usa fallback Geral sem inventar contexto para conteúdo insuficiente", () => {
  const metadata = classifyPrompt({ title: "Teste", content: "teste" });

  assert.equal(metadata.category, "Geral");
  assert.equal(metadata.description, "Prompt de uso geral com instruções breves.");
  assert.deepEqual(metadata.tags, ["prompt", "geral", "instruções"]);
});

test("enriquece somente a linha sem metadados e preserva a curada", () => {
  const rows = [
    { title: "Terminal Linux", description: "", content: "Atue como um terminal Linux e execute comandos no console.", type: "TEXT", category: "", tags: "", is_favorite: "FALSE", is_archived: "FALSE" },
    { title: "Curado", description: "Descrição existente.", content: "Conteúdo existente.", type: "TEXT", category: "Tecnologia", tags: "existente;preservado", is_favorite: "FALSE", is_archived: "FALSE" }
  ];

  const enriched = enrichRows(rows);

  assert.equal(enriched[0].category, "Tecnologia");
  assert.equal(enriched[0].tags, "linux;terminal;comandos;tecnologia;ferramentas");
  assert.deepEqual(enriched[1], rows[1]);
});

test("marca como SKILL um conteúdo com frontmatter e instruções de uso", () => {
  const [enriched] = enrichRows([{
    title: "Skill de teste",
    description: "", 
    content: "---\nnome: skill-de-teste\ndescrição: Executa uma tarefa específica.\n---\n\n## Quando usar\nUse esta habilidade quando precisar executar a tarefa.\n\n## Processo\nSempre siga estas instruções.",
    type: "TEXT",
    category: "",
    tags: "",
    is_favorite: "FALSE",
    is_archived: "FALSE"
  }]);

  assert.equal(enriched.type, "SKILL");
});

test("seleciona skills explícitas e conteúdos com três sinais operacionais", () => {
  assert.equal(isOperationalPrompt({ type: "SKILL", content: "Prompt curto." }), true);
  assert.equal(isOperationalPrompt({
    type: "TEXT",
    content: "## Processo\n1. Execute o passo inicial.\n2. Valide o resultado.\n\nAntes de executar, instale as dependências.\n\nRode npm test para conferir a validação."
  }), true);
  assert.equal(isOperationalPrompt({ type: "TEXT", content: "Use Docker para executar a aplicação." }), false);
});

test("particiona cada prompt em operacional ou catálogo sem perder linhas", () => {
  const rows = [
    { title: "Skill", type: "SKILL", content: "Curto" },
    { title: "Operacional", type: "TEXT", content: "1. Execute.\nAntes de iniciar, instale dependências.\nRode npm test para validação." },
    { title: "Catálogo", type: "TEXT", content: "Escreva uma frase inspiradora." }
  ];

  const { operational, catalog } = partitionOperationalRows(rows);

  assert.deepEqual(operational.map((row) => row.title), ["Skill", "Operacional"]);
  assert.deepEqual(catalog.map((row) => row.title), ["Catálogo"]);
  assert.equal(operational.length + catalog.length, rows.length);
});
