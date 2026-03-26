import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import PDFDocument from "pdfkit";
import { CorrecaoService } from "./services/correcaoService";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Configurar multer para upload em memória
const upload = multer({ storage: multer.memoryStorage() });

const resolveDataPath = (envPath: string | undefined, defaultRelativePath: string) =>
  envPath ? path.resolve(envPath) : path.resolve(process.cwd(), defaultRelativePath);

const FILE_PATH = resolveDataPath(process.env.PROVAS_FILE_PATH, "./data/provas.json");
const RESPOSTAS_FILE_PATH = resolveDataPath(process.env.RESPOSTAS_FILE_PATH, "./data/respostas.json");
const PROVAS_GERADAS_FILE_PATH = resolveDataPath(
  process.env.PROVAS_GERADAS_FILE_PATH,
  "./data/provas_geradas.json"
);

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

// Deletar prova
app.delete("/api/provas/:id", (req, res) => {
  const id = req.params.id;

  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    let provas = JSON.parse(data);

    const index = provas.findIndex((p: any) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ erro: "Prova não encontrada" });
    }

    provas.splice(index, 1);
    fs.writeFileSync(FILE_PATH, JSON.stringify(provas, null, 2));

    res.json({ mensagem: "Prova deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar prova" });
  }
});

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
      questoes: prova.questoes,
      provaFormat: prova.alternativasFormat || "letras"
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao processar respostas" });
  }
});

// Correção em lote via CSV
app.post("/api/provas/:id/correcao/lote", upload.single("file"), (req, res) => {
  const provaId = req.params.id;

  try {
    // Validar se arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ erro: "Arquivo CSV é obrigatório" });
    }

    // Buscar prova
    const provasData = fs.readFileSync(FILE_PATH, "utf-8");
    const prova = JSON.parse(provasData).find((p: any) => p.id === provaId);

    if (!prova) {
      return res.status(404).json({ erro: "Prova não encontrada" });
    }

    const totalQuestoes = prova.questoes.length;
    const formato = prova.alternativasFormat || "letras";

    // Parsear CSV
    const csvContent = req.file.buffer.toString("utf-8");
    const linhas = csvContent.trim().split("\n");

    if (linhas.length < 2) {
      return res.status(400).json({ erro: "CSV deve conter pelo menos 1 linha de dados" });
    }

    // Validar header
    const primeiraLinha = linhas[0];
    if (!primeiraLinha) {
      return res.status(400).json({ erro: "CSV vazio." });
    }

    const header = primeiraLinha.split(",").map((h: string) => h.trim());
    if (header[0] !== "aluno" || header.length !== totalQuestoes + 1) {
      return res.status(400).json({
        erro: `CSV inválido. Esperado: aluno + ${totalQuestoes} colunas de resposta. Recebido: ${header.join(", ")}`
      });
    }

    // Função para converter resposta de letras/potências para índice
    const converterResposta = (valor: string): number | null => {
      valor = valor.trim().toUpperCase();

      if (formato === "letras") {
        // A → 0, B → 1, C → 2, etc
        if (valor.length === 1 && valor >= "A" && valor <= "E") {
          return valor.charCodeAt(0) - 65;
        }
      } else if (formato === "potencias") {
        // 1 → 0, 2 → 1, 4 → 2, 8 → 3, 16 → 4
        const num = parseInt(valor, 10);
        const index = Math.log2(num);
        if ([1, 2, 4, 8, 16].includes(num) && Number.isInteger(index)) {
          return index;
        }
      }

      return null;
    };

    // Processar linhas
    const resultado = [];
    const erros = [];

    for (let i = 1; i < linhas.length; i++) {
      const linhaAtual = linhas[i];
      if (linhaAtual === undefined || linhaAtual.trim() === "") {
        continue;
      }

      const linha = linhaAtual.split(",").map((v: string) => v.trim());

      // Validar quantidade de colunas
      if (linha.length !== totalQuestoes + 1) {
        erros.push({
          linha: i + 1,
          aluno: linha[0] || "<sem nome>",
          erro: `Esperado ${totalQuestoes + 1} colunas, recebido ${linha.length}`
        });
        continue;
      }

      const nomeAluno = linha[0];
      if (!nomeAluno) {
        erros.push({
          linha: i + 1,
          aluno: "<sem nome>",
          erro: "Nome do aluno não pode estar vazio"
        });
        continue;
      }

      // Converter respostas
      const respostasConvertidas: number[] = [];
      let erroConversao = false;

      for (let j = 1; j <= totalQuestoes; j++) {
        const valor = linha[j];
        if (valor === undefined) {
          erros.push({
            linha: i + 1,
            erro: `Valor ausente na coluna ${j + 1}.`,
          });
          erroConversao = true;
          break;
        }

        const indice = converterResposta(valor);

        if (indice === null) {
          erros.push({
            linha: i + 1,
            aluno: nomeAluno,
            erro: `Resposta inválida na questão ${j}: "${valor}"`
          });
          erroConversao = true;
          break;
        }

        respostasConvertidas.push(indice);
      }

      // Se teve erro de conversão, pular para próxima linha
      if (erroConversao) {
        continue;
      }

      // Corrigir usando CorrecaoService
      const nota = CorrecaoService.corrigir(prova, respostasConvertidas);

      // Contar acertos
      const acertos = respostasConvertidas.filter(
        (resposta, idx) => resposta === prova.questoes[idx].respostaCorreta
      ).length;

      resultado.push({
        aluno: nomeAluno,
        acertos,
        total: totalQuestoes,
        nota: Math.round(nota * 100) / 100,
        respostas: respostasConvertidas
      });
    }

    // Retornar resultado
    res.json({
      idProva: provaId,
      totalQuestoes,
      totalAlunos: resultado.length,
      erros: erros.length > 0 ? erros : undefined,
      resultado
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao processar CSV", detalhes: (error as any).message });
  }
});

// Gerar CSV de gabarito da prova
app.get("/api/provas/:id/gabarito/csv", (req, res) => {
  const id = req.params.id;

  try {
    const provasData = fs.readFileSync(FILE_PATH, "utf-8");
    const prova = JSON.parse(provasData).find((p: any) => p.id === id);

    if (!prova) {
      return res.status(404).json({ erro: "Prova não encontrada" });
    }

    const formato = prova.alternativasFormat || "letras";
    
    // Header do CSV
    let csv = "numero_questao,gabarito\n";

    // Gerar linhas do CSV
    prova.questoes.forEach((q: any, index: number) => {
      const numeroQuestao = index + 1;
      let gabarito = q.respostaCorreta;
      
      if (formato === "letras") {
        // Converter índice para letra: 0 → A, 1 → B, etc
        gabarito = String.fromCharCode(65 + q.respostaCorreta);
      } else if (formato === "potencias") {
        // Converter índice para potência de 2: 0 → 1, 1 → 2, 2 → 4, etc
        gabarito = Math.pow(2, q.respostaCorreta);
      }
      
      csv += `${numeroQuestao},${gabarito}\n`;
    });

    // Enviar como arquivo CSV
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="gabarito_prova_${id}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao gerar gabarito" });
  }
});

// Gerar PDF com múltiplas versões variadas da prova
app.post("/api/provas/:id/gerar-pdfs", (req, res) => {
  const provaId = req.params.id;
  const { quantidade } = req.body;

  try {
    // Validar quantidade
    if (!quantidade || quantidade < 1 || quantidade > 100) {
      return res.status(400).json({ erro: "Quantidade deve estar entre 1 e 100" });
    }

    // Buscar prova
    const provasData = fs.readFileSync(FILE_PATH, "utf-8");
    const prova = JSON.parse(provasData).find((p: any) => p.id === provaId);

    if (!prova) {
      return res.status(404).json({ erro: "Prova não encontrada" });
    }

    if (prova.questoes.length === 0) {
      return res.status(400).json({ erro: "Prova deve conter pelo menos 1 questão" });
    }

    // Funções auxiliares para embaralhamento
    const shuffleArray = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const itemAtual = arr[i];
        const itemSorteado = arr[j];

        if (itemAtual === undefined || itemSorteado === undefined) {
          continue;
        }

        arr[i] = itemSorteado;
        arr[j] = itemAtual;
      }
      return arr;
    };

    // Embaralhar alternativas e rastrear novo índice da resposta correta
    const formatarResposta = (indice: number, formatoAtual: "letras" | "potencias") => {
      if (formatoAtual === "potencias") {
        return Math.pow(2, indice).toString();
      }

      return String.fromCharCode(65 + indice);
    };

    const embaralharAlternativas = (alternativas: string[], respostaOriginal: number) => {
      const withIndices = alternativas.map((alt, idx) => ({ alt, idx }));
      const embaralhado = shuffleArray(withIndices);
      const novaRespostaCorreta = embaralhado.findIndex((item) => item.idx === respostaOriginal);
      return {
        alternativas: embaralhado.map((item) => item.alt),
        respostaCorreta: novaRespostaCorreta
      };
    };

    // Gerar N versões variadas da prova
    interface ProvaVariada {
      numero: number;
      ordemQuestoes: number[];
      questoes: Array<{
        enunciado: string;
        alternativas: string[];
        respostaCorretaNovaOrdem: number;
      }>;
      gabarito: number[]; // Respostas corretas na ordem das questões embaralhadas
    }

    const provasVariadas: ProvaVariada[] = [];
    const formato = prova.alternativasFormat || "letras";

    for (let v = 0; v < quantidade; v++) {
      // Embaralhar ordem das questões
      const questoesIndices = Array.from({ length: prova.questoes.length }, (_, i) => i);
      const questoesEmbaralhadas = shuffleArray(questoesIndices);

      const questoesVariadas = [];
      const gabaritoVariado: number[] = [];

      // Para cada questão embaralhada
      for (const questaoIdx of questoesEmbaralhadas) {
        const questaoOriginal = prova.questoes[questaoIdx];

        // Embaralhar alternativas desta questão
        const { alternativas: altEmbaralhadas, respostaCorreta: respostaNovaOrdem } =
          embaralharAlternativas(questaoOriginal.alternativas, questaoOriginal.respostaCorreta);

        questoesVariadas.push({
          enunciado: questaoOriginal.enunciado,
          alternativas: altEmbaralhadas,
          respostaCorretaNovaOrdem: respostaNovaOrdem
        });

        // Rastrear gabarito da nova ordem
        gabaritoVariado.push(respostaNovaOrdem);
      }

      provasVariadas.push({
        numero: v + 1,
        ordemQuestoes: questoesEmbaralhadas,
        questoes: questoesVariadas,
        gabarito: gabaritoVariado
      });
    }

    let provasGeradas = [];
    try {
      const conteudo = fs.readFileSync(PROVAS_GERADAS_FILE_PATH, "utf-8");
      provasGeradas = JSON.parse(conteudo);
      if (!Array.isArray(provasGeradas)) {
        provasGeradas = [];
      }
    } catch {
      provasGeradas = [];
    }

    const generatedAt = new Date().toISOString();
    const registroGeracao = {
      provaId,
      generatedAt,
      quantidade,
      formato,
      versions: provasVariadas.map((provaVariada) => ({
        numero: provaVariada.numero,
        gabarito: provaVariada.gabarito.map((indice) => formatarResposta(indice, formato)),
        ordemQuestoes: provaVariada.ordemQuestoes
      }))
    };

    provasGeradas.push(registroGeracao);
    fs.writeFileSync(PROVAS_GERADAS_FILE_PATH, JSON.stringify(provasGeradas, null, 2));

    // Gerar PDF com as provas variadas
    const doc = new PDFDocument({ bufferPages: true });
    const chunks: any[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="provas_${provaId}_${quantidade}x.pdf"`
      );
      res.send(pdfBuffer);
    });

    // Renderizar cada prova variada no PDF
    provasVariadas.forEach((provaVariada, idx) => {
      if (idx > 0) {
        doc.addPage();
      }

      // Cabeçalho
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(prova.titulo, { align: "center" })
        .moveDown(0.5);

      doc.fontSize(10).font("Helvetica").text(`Versão ${provaVariada.numero}`, {
        align: "center"
      });

      doc.fontSize(9).text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, {
        align: "center"
      });

      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);

      // Questões
      provaVariada.questoes.forEach((questao, qIdx) => {
        doc.fontSize(11).font("Helvetica-Bold").text(`Questão ${qIdx + 1}:`);
        doc.fontSize(10).font("Helvetica").text(questao.enunciado);
        doc.moveDown(0.3);

        // Alternativas
        questao.alternativas.forEach((alt, altIdx) => {
          let label: string;
          if (formato === "letras") {
            label = String.fromCharCode(65 + altIdx);
          } else {
            label = Math.pow(2, altIdx).toString();
          }

          doc.fontSize(9).text(`(${label}) ${alt}`);
        });

        doc.moveDown(0.8);
      });

      // Espaço para resposta e identificação
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(9).text("Nome do aluno: _______________________________________________");
      doc.moveDown(0.4);
      doc.text("CPF: _______________________________________________");
      doc.moveDown(0.4);
      doc.text("Assinatura: _______________________________________________");
      doc.moveDown(0.5);

      // Rodapé
      doc.fontSize(8).text(`Versão: ${provaVariada.numero} | ID Prova: ${provaId}`, {
        align: "center"
      });

      // Comentário no PDF indicando acesso ao gabarito (somente no código)
      // Gabarito preservado em: provaVariada.gabarito (array de índices das alternativas corretas)
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ erro: "Erro ao gerar PDF", detalhes: (error as any).message });
  }
});

app.get("/api/provas/:id/versoes-geradas", (req, res) => {
  const provaId = req.params.id;

  try {
    let provasGeradas = [];

    try {
      const conteudo = fs.readFileSync(PROVAS_GERADAS_FILE_PATH, "utf-8");
      provasGeradas = JSON.parse(conteudo);
      if (!Array.isArray(provasGeradas)) {
        provasGeradas = [];
      }
    } catch {
      provasGeradas = [];
    }

    const geracoesDaProva = provasGeradas.filter((geracao: any) => geracao.provaId === provaId);

    res.json({
      provaId,
      totalGeracoes: geracoesDaProva.length,
      geracoes: geracoesDaProva
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar versoes geradas", detalhes: (error as any).message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

export { app };
