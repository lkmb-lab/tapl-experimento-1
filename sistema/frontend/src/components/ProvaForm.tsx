import React, { useState, useEffect } from "react";
import { Prova, Questao } from "../types";
import { apiService } from "../services/api";

interface ProvaFormProps {
  onSalvo: () => void;
  onCancelar: () => void;
  provaEditar?: Prova | null;
}

export const ProvaForm: React.FC<ProvaFormProps> = ({ onSalvo, onCancelar, provaEditar }) => {
  const [titulo, setTitulo] = useState("");
  const [alternativasFormat, setAlternativasFormat] = useState<"letras" | "potencias">("letras");
  const [questaoTexto, setQuestaoTexto] = useState("");
  const [alternativa0, setAlternativa0] = useState("");
  const [alternativa1, setAlternativa1] = useState("");
  const [alternativa2, setAlternativa2] = useState("");
  const [respostaCorreta, setRespostaCorreta] = useState("0");
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [questaoEditandoIndex, setQuestaoEditandoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (provaEditar) {
      setTitulo(provaEditar.titulo);
      setAlternativasFormat(provaEditar.alternativasFormat || "letras");
      setQuestoes(provaEditar.questoes);
    }
  }, [provaEditar]);

  const adicionarOuEditarQuestao = () => {
    if (!questaoTexto.trim()) {
      alert("Digite o enunciado da questão");
      return;
    }
    if (!alternativa0.trim() || !alternativa1.trim() || !alternativa2.trim()) {
      alert("Preencha todas as alternativas");
      return;
    }

    const novaQuestao: Questao = {
      id: questaoEditandoIndex !== null ? questoes[questaoEditandoIndex].id : Date.now().toString(),
      enunciado: questaoTexto,
      alternativas: [alternativa0, alternativa1, alternativa2],
      respostaCorreta: parseInt(respostaCorreta)
    };

    if (questaoEditandoIndex !== null) {
      const novasQuestoes = [...questoes];
      novasQuestoes[questaoEditandoIndex] = novaQuestao;
      setQuestoes(novasQuestoes);
      setQuestaoEditandoIndex(null);
    } else {
      setQuestoes([...questoes, novaQuestao]);
    }

    setQuestaoTexto("");
    setAlternativa0("");
    setAlternativa1("");
    setAlternativa2("");
    setRespostaCorreta("0");
  };

  const iniciarEdicaoQuestao = (index: number) => {
    const q = questoes[index];
    setQuestaoTexto(q.enunciado);
    setAlternativa0(q.alternativas[0]);
    setAlternativa1(q.alternativas[1]);
    setAlternativa2(q.alternativas[2]);
    setRespostaCorreta(q.respostaCorreta.toString());
    setQuestaoEditandoIndex(index);
  };

  const cancelarEdicaoQuestao = () => {
    setQuestaoTexto("");
    setAlternativa0("");
    setAlternativa1("");
    setAlternativa2("");
    setRespostaCorreta("0");
    setQuestaoEditandoIndex(null);
  };

  const removerQuestao = (index: number) => {
    setQuestoes(questoes.filter((_, i) => i !== index));
    if (questaoEditandoIndex === index) {
      cancelarEdicaoQuestao();
    }
  };

  const salvarProva = async () => {
    if (!titulo.trim()) {
      alert("Digite o título da prova");
      return;
    }
    if (questoes.length === 0) {
      alert("Adicione pelo menos uma questão");
      return;
    }

    setSalvando(true);
    try {
      if (provaEditar) {
        // Modo edição
        const provaAtualizada: Prova = {
          ...provaEditar,
          titulo,
          questoes,
          alternativasFormat
        };
        await apiService.atualizarProva(provaEditar.id, provaAtualizada);
        alert("Prova atualizada com sucesso!");
      } else {
        // Modo criação
        const novaProva: Prova = {
          id: Date.now().toString(),
          titulo,
          questoes,
          dataCriacao: new Date().toISOString(),
          alternativasFormat
        };
        await apiService.criarProva(novaProva);
        alert("Prova criada com sucesso!");
      }
      onSalvo();
    } catch (error) {
      console.error("Erro ao salvar prova:", error);
      alert("Erro ao salvar prova");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>{provaEditar ? "Editar Prova" : "Criar Nova Prova"}</h2>

      {/* Seção: Dados da Prova */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Dados da Prova</h3>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título da prova"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box"
          }}
        />
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>Formato das alternativas:</strong>
          </label>
          <select
            value={alternativasFormat}
            onChange={(e) => setAlternativasFormat(e.target.value as "letras" | "potencias")}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box"
            }}
          >
            <option value="letras">Letras (A, B, C)</option>
            <option value="potencias">Potências de 2 (1, 2, 4)</option>
          </select>
        </div>
      </div>

      {/* Seção: Adicionar/Editar Questão */}
      <div style={{ marginBottom: "30px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
        <h3>{questaoEditandoIndex !== null ? "Editando Questão" : "Adicionar Questão"}</h3>

        <textarea
          value={questaoTexto}
          onChange={(e) => setQuestaoTexto(e.target.value)}
          placeholder="Enunciado da questão"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
            minHeight: "80px"
          }}
        />

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>Alternativa A:</strong>
          </label>
          <input
            type="text"
            value={alternativa0}
            onChange={(e) => setAlternativa0(e.target.value)}
            placeholder="Alternativa A"
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "5px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>Alternativa B:</strong>
          </label>
          <input
            type="text"
            value={alternativa1}
            onChange={(e) => setAlternativa1(e.target.value)}
            placeholder="Alternativa B"
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "5px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>Alternativa C:</strong>
          </label>
          <input
            type="text"
            value={alternativa2}
            onChange={(e) => setAlternativa2(e.target.value)}
            placeholder="Alternativa C"
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "5px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>Resposta Correta:</strong>
          </label>
          <select
            value={respostaCorreta}
            onChange={(e) => setRespostaCorreta(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box"
            }}
          >
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={adicionarOuEditarQuestao}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {questaoEditandoIndex !== null ? "Salvar Edição" : "+ Adicionar Questão"}
          </button>
          {questaoEditandoIndex !== null && (
            <button
              onClick={cancelarEdicaoQuestao}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Cancelar Edição
            </button>
          )}
        </div>
      </div>

      {/* Seção: Questões Adicionadas */}
      {questoes.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Questões Adicionadas ({questoes.length})</h3>
          {questoes.map((q, index) => (
            <div
              key={q.id}
              style={{
                marginBottom: "10px",
                padding: "10px",
                border: questaoEditandoIndex === index ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: questaoEditandoIndex === index ? "#e7f3ff" : "#f9f9f9"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                    Q{index + 1}: {q.enunciado.substring(0, 50)}...
                  </p>
                  <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                    Resposta correta: {["A", "B", "C"][q.respostaCorreta]}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => iniciarEdicaoQuestao(index)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffc107",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removerQuestao(index)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botões */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={onCancelar}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ccc",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Cancelar
        </button>
        <button
          onClick={salvarProva}
          disabled={salvando}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: salvando ? "not-allowed" : "pointer"
          }}
        >
          {salvando ? "Salvando..." : `${provaEditar ? "Atualizar" : "Salvar"} Prova`}
        </button>
      </div>
    </div>
  );
};