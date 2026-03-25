import express from "express";
import cors from "cors";
import fs from "fs";
import { CorrecaoService } from "./services/correcaoService";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const FILE_PATH = "./data/provas.json";

// Listar provas
app.get("/api/provas", (req, res) => {
  const data = fs.readFileSync(FILE_PATH, "utf-8");
  const provas = JSON.parse(data);
  res.json(provas);
});

// Criar prova
app.post("/api/provas", (req, res) => {
  const novaProva = req.body;

  const data = fs.readFileSync(FILE_PATH, "utf-8");
  const provas = JSON.parse(data);

  provas.push(novaProva);

  fs.writeFileSync(FILE_PATH, JSON.stringify(provas, null, 2));

  res.status(201).json(novaProva);
});

// Atualizar prova
app.put("/api/provas/:id", (req, res) => {
  const id = req.params.id;
  const provaAtualizada = req.body;

  const data = fs.readFileSync(FILE_PATH, "utf-8");
  let provas = JSON.parse(data);

  const index = provas.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Prova não encontrada" });
  }

  provas[index] = provaAtualizada;

  fs.writeFileSync(FILE_PATH, JSON.stringify(provas, null, 2));

  res.json(provaAtualizada);
});

// Respostas
const RESPOSTAS_FILE_PATH = "./data/respostas.json";

// Listar respostas
app.get("/api/respostas", (req, res) => {
  const data = fs.readFileSync(RESPOSTAS_FILE_PATH, "utf-8");
  const respostas = JSON.parse(data);
  res.json(respostas);
});

// Obter resultado detalhado de uma resposta específica
app.get("/api/respostas/:id", (req, res) => {
  const id = req.params.id;

  try {
    const fileContent = fs.readFileSync(RESPOSTAS_FILE_PATH, "utf-8");
    const respostas = JSON.parse(fileContent);
    const resposta = respostas.find((r: any) => r.id === id);

    if (!resposta) {
      return res.status(404).json({ erro: "Resposta não encontrada" });
    }

    // Buscar prova para enviar gabarito
    const provasData = fs.readFileSync(FILE_PATH, "utf-8");
    const prova = JSON.parse(provasData).find((p: any) => p.id === resposta.provaId);

    res.json({
      ...resposta,
      gabarito: prova.questoes.map((q: any) => q.respostaCorreta),
      questoes: prova.questoes
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar resposta" });
  }
});

// Criar resposta COM CORREÇÃO AUTOMÁTICA
app.post("/api/respostas", (req, res) => {
  const { provaId, respostas } = req.body;

  // Validar entrada
  if (!provaId || !Array.isArray(respostas)) {
    return res.status(400).json({ erro: "provaId e respostas são obrigatórios" });
  }

  // Buscar prova para obter gabarito
  try {
    const provasData = fs.readFileSync(FILE_PATH, "utf-8");
    const prova = JSON.parse(provasData).find((p: any) => p.id === provaId);

    if (!prova) {
      return res.status(404).json({ erro: "Prova não encontrada" });
    }

    // Corrigir usando o serviço
    const pontuacaoTotal = CorrecaoService.corrigir(prova, respostas);

    // Criar objeto de resposta
    const novaResposta = {
      id: Date.now().toString(),
      provaId,
      respostas,
      pontuacaoTotal,
      statusCorreacao: "corrigida",
      dataSubmissao: new Date().toISOString()
    };

    // Salvar em respostas.json
    let respostasData = [];
    try {
      const fileContent = fs.readFileSync(RESPOSTAS_FILE_PATH, "utf-8");
      respostasData = JSON.parse(fileContent);
    } catch {
      respostasData = [];
    }

    respostasData.push(novaResposta);
    fs.writeFileSync(RESPOSTAS_FILE_PATH, JSON.stringify(respostasData, null, 2));

    // Retornar resultado com gabarito para o frontend
    res.status(201).json({
      ...novaResposta,
      gabarito: prova.questoes.map((q: any) => q.respostaCorreta),
      questoes: prova.questoes
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao processar respostas" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

