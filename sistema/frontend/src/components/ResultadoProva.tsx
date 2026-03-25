import React from "react";
import { Resposta } from "../types";

interface ResultadoProvaProps {
  resposta: Resposta;
  onVoltarALista: () => void;
}

export const ResultadoProva: React.FC<ResultadoProvaProps> = ({
  resposta,
  onVoltarALista
}) => {
  if (!resposta.questoes || !resposta.gabarito) {
    return <div>Dados de resultado não disponíveis</div>;
  }

  const totalQuestoes = resposta.questoes.length;
  const acertos = resposta.respostas.filter(
    (r, index) => r === resposta.gabarito?.[index]
  ).length;
  const erros = totalQuestoes - acertos;
  const percentual = ((acertos / totalQuestoes) * 100).toFixed(1);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Resultado da Prova</h2>

      {/* Placar */}
      <div
        style={{
          backgroundColor: parseFloat(percentual) >= 70 ? "#d4edda" : "#f8d7da",
          border: `2px solid ${parseFloat(percentual) >= 70 ? "#28a745" : "#dc3545"}`,
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
          textAlign: "center"
        }}
      >
        <h3 style={{ margin: "0 0 10px 0" }}>Pontuação</h3>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: parseFloat(percentual) >= 70 ? "#28a745" : "#dc3545" }}>
          {percentual}%
        </div>
        <p style={{ margin: "10px 0 0 0", fontSize: "18px" }}>
          {acertos} de {totalQuestoes} questões corretas
        </p>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
          {acertos} acertos • {erros} erros
        </p>
      </div>

      {/* Detalhes das questões */}
      <h3>Análise das Respostas</h3>
      <div>
        {resposta.questoes.map((questao, index) => {
          const usuarioAcertou = resposta.respostas[index] === resposta.gabarito?.[index];
          const respostaDoUsuario = resposta.respostas[index];
          const respostaCorreta = resposta.gabarito?.[index];

          return (
            <div
              key={questao.id}
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: `2px solid ${usuarioAcertou ? "#28a745" : "#dc3545"}`,
                borderRadius: "5px",
                backgroundColor: usuarioAcertou ? "#f0fff0" : "#fff5f5"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px", marginRight: "10px" }}>
                  {usuarioAcertou ? "✓" : "✗"}
                </span>
                <h4 style={{ margin: "0" }}>
                  Questão {index + 1}
                </h4>
              </div>

              <p style={{ marginBottom: "10px", fontSize: "16px" }}>
                <strong>{questao.enunciado}</strong>
              </p>

              <div style={{ marginLeft: "20px", fontSize: "14px" }}>
                <p>
                  <strong style={{ color: usuarioAcertou ? "#28a745" : "#dc3545" }}>
                    Sua resposta:
                  </strong>{" "}
                  {questao.alternativas[respostaDoUsuario]}
                </p>

                {!usuarioAcertou && (
                  <p>
                    <strong style={{ color: "#28a745" }}>Resposta correta:</strong>{" "}
                    {questao.alternativas[respostaCorreta!]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botões */}
      <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={onVoltarALista}
          style={{
            padding: "12px 25px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Voltar para Provas
        </button>
      </div>
    </div>
  );
};
