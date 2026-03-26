import { Before, After, Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import request, { Response, type SuperTest, type Test } from "supertest";

type AppType = Parameters<typeof request>[0];

let app: AppType;
let client: ReturnType<typeof request>;
let lastResponse: Response;
let currentProvaId: string | undefined;
let tempDir: string;
let provasFilePath: string;
let respostasFilePath: string;
let provasGeradasFilePath: string;

const serverModulePath = path.resolve(__dirname, "../../../src/server");

const writeJson = (filePath: string, content: unknown) => {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
};

const createProvaPayload = (titulo: string, formato: "letras" | "potencias" = "letras") => ({
  id: `prova-${Date.now()}`,
  titulo,
  alternativasFormat: formato,
  questoes: [
    {
      id: "q1",
      enunciado: "Quanto é 2 + 2?",
      alternativas: ["1", "2", "3", "4"],
      respostaCorreta: 3
    },
    {
      id: "q2",
      enunciado: "Capital do Pará?",
      alternativas: ["Manaus", "Belém", "Recife"],
      respostaCorreta: 1
    }
  ]
});

const importFreshApp = () => {
  delete require.cache[require.resolve(serverModulePath)];
  const loadedModule = require(serverModulePath) as { app: AppType };
  return loadedModule.app;
};

Before(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "backend-cucumber-"));
  provasFilePath = path.join(tempDir, "provas.json");
  respostasFilePath = path.join(tempDir, "respostas.json");
  provasGeradasFilePath = path.join(tempDir, "provas_geradas.json");

  writeJson(provasFilePath, []);
  writeJson(respostasFilePath, []);
  writeJson(provasGeradasFilePath, []);

  process.env.PROVAS_FILE_PATH = provasFilePath;
  process.env.RESPOSTAS_FILE_PATH = respostasFilePath;
  process.env.PROVAS_GERADAS_FILE_PATH = provasGeradasFilePath;

  app = importFreshApp();
  client = request(app);
  currentProvaId = undefined;
});

After(() => {
  delete process.env.PROVAS_FILE_PATH;
  delete process.env.RESPOSTAS_FILE_PATH;
  delete process.env.PROVAS_GERADAS_FILE_PATH;
  delete require.cache[require.resolve(serverModulePath)];
  fs.rmSync(tempDir, { recursive: true, force: true });
});

Given("que existe uma prova cadastrada chamada {string}", async (titulo: string) => {
  const payload = createProvaPayload(titulo);
  const response = await client.post("/api/provas").send(payload);
  assert.strictEqual(response.status, 201);
  currentProvaId = payload.id;
});

Given(
  "que existe uma prova com formato {string} e 2 questões",
  async (formato: "letras" | "potencias") => {
    const payload = createProvaPayload(`Prova ${formato}`, formato);
    const response = await client.post("/api/provas").send(payload);
    assert.strictEqual(response.status, 201);
    currentProvaId = payload.id;
  }
);

When("eu criar uma prova chamada {string}", async (titulo: string) => {
  const payload = createProvaPayload(titulo);
  currentProvaId = payload.id;
  lastResponse = await client.post("/api/provas").send(payload);
});

When("eu atualizar essa prova para {string}", async (novoTitulo: string) => {
  assert.ok(currentProvaId);
  const payload = createProvaPayload(novoTitulo);
  payload.id = currentProvaId;
  lastResponse = await client.put(`/api/provas/${currentProvaId}`).send(payload);
});

When("eu excluir essa prova", async () => {
  assert.ok(currentProvaId);
  lastResponse = await client.delete(`/api/provas/${currentProvaId}`);
});

When("eu gerar o gabarito CSV dessa prova", async () => {
  assert.ok(currentProvaId);
  lastResponse = await client.get(`/api/provas/${currentProvaId}/gabarito/csv`);
});

When("eu enviar um arquivo CSV de respostas válido", async () => {
  assert.ok(currentProvaId);
  const csv = ["aluno,1,2", "Ana,8,2"].join("\n");
  lastResponse = await client
    .post(`/api/provas/${currentProvaId}/correcao/lote`)
    .attach("file", Buffer.from(csv, "utf-8"), "respostas.csv");
});

When("eu gerar {int} PDFs individuais dessa prova", async (quantidade: number) => {
  assert.ok(currentProvaId);
  lastResponse = await client
    .post(`/api/provas/${currentProvaId}/gerar-pdfs`)
    .send({ quantidade });
});

Then("a resposta deve ter status {int}", (statusCode: number) => {
  assert.strictEqual(lastResponse.status, statusCode);
});

Then("a prova criada deve aparecer na listagem", async () => {
  assert.ok(currentProvaId);
  const response = await client.get("/api/provas");
  const provas = response.body as Array<{ id: string }>;
  assert.ok(provas.some((prova) => prova.id === currentProvaId));
});

Then("a prova atualizada deve ter o título {string}", async (titulo: string) => {
  assert.ok(currentProvaId);
  const response = await client.get("/api/provas");
  const provas = response.body as Array<{ id: string; titulo: string }>;
  const prova = provas.find((item) => item.id === currentProvaId);
  assert.ok(prova);
  assert.strictEqual(prova.titulo, titulo);
});

Then("a prova removida não deve aparecer na listagem", async () => {
  assert.ok(currentProvaId);
  const response = await client.get("/api/provas");
  const provas = response.body as Array<{ id: string }>;
  assert.ok(!provas.some((prova) => prova.id === currentProvaId));
});

Then("o CSV deve conter o gabarito esperado", () => {
  assert.match(lastResponse.headers["content-type"] ?? "", /text\/csv/);
  assert.strictEqual(lastResponse.text, "numero_questao,gabarito\n1,D\n2,B\n");
});

Then("a correção em lote deve indicar 1 aluno corrigido com nota 2", () => {
  assert.strictEqual(lastResponse.body.totalAlunos, 1);
  assert.strictEqual(lastResponse.body.resultado[0].aluno, "Ana");
  assert.strictEqual(lastResponse.body.resultado[0].nota, 100);
});

Then("o retorno deve ser um arquivo PDF", () => {
  assert.match(lastResponse.headers["content-type"] ?? "", /application\/pdf/);
  assert.ok(lastResponse.body);
});

Then("os metadados das versões devem ser salvos em JSON", () => {
  assert.ok(currentProvaId);
  const savedContent = fs.readFileSync(provasGeradasFilePath, "utf-8");
  const geracoes = JSON.parse(savedContent) as Array<{
    provaId: string;
    quantidade: number;
    formato: string;
    versions: Array<{ numero: number; gabarito: string[]; ordemQuestoes: number[] }>;
  }>;

  assert.strictEqual(geracoes.length, 1);
  assert.strictEqual(geracoes[0]?.provaId, currentProvaId);
  assert.strictEqual(geracoes[0]?.quantidade, 2);
  assert.strictEqual(geracoes[0]?.formato, "letras");
  assert.strictEqual(geracoes[0]?.versions.length, 2);
  assert.strictEqual(geracoes[0]?.versions[0]?.numero, 1);
  assert.strictEqual(geracoes[0]?.versions[1]?.numero, 2);
});
