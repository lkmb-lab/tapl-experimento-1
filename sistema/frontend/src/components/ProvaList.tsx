import React, { useState, useEffect } from "react";
import { Prova } from "../types";
import { apiService } from "../services/api";

interface ProvaListProps {
  onResponder: (provaId: string) => void;
  onCriar: () => void;
  onEditar: (prova: Prova) => void;
}

export const ProvaList: React.FC<ProvaListProps> = ({ onResponder, onCriar, onEditar }) => {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarProvas = async () => {
    try {
      const data = await apiService.getProvas();
      setProvas(data);
    } catch (error) {
      console.error("Erro ao carregar provas:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProvas();
  }, []);

  const deletarProva = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja deletar esta prova?")) {
      return;
    }
    try {
      await apiService.deletarProva(id);
      carregarProvas();
    } catch (error) {
      console.error("Erro ao deletar prova:", error);
      alert("Erro ao deletar prova");
    }
  };

  if (carregando) return <div>Carregando provas...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Sistema de Provas</h1>

      <button
        onClick={onCriar}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
          fontSize: "16px"
        }}
      >
        + Criar Nova Prova
      </button>

      <h2>Provas Disponíveis</h2>

      {provas.length === 0 ? (
        <p style={{ color: "#666" }}>Nenhuma prova disponível</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {provas.map((prova) => (
            <div
              key={prova.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "#f9f9f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{prova.titulo}</h3>
                <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                  {prova.questoes.length} questões • Formato: {prova.alternativasFormat || "letras"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    if (prova.questoes.length === 0) {
                      alert("Esta prova não tem questões ainda!");
                      return;
                    }
                    onResponder(prova.id);
                  }}
                  disabled={prova.questoes.length === 0}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: prova.questoes.length > 0 ? "#007bff" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: prova.questoes.length > 0 ? "pointer" : "not-allowed"
                  }}
                >
                  Responder
                </button>
                <button
                  onClick={() => onEditar(prova)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => apiService.downloadGabarito(prova.id)}
                  disabled={prova.questoes.length === 0}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: prova.questoes.length > 0 ? "#6f42c1" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: prova.questoes.length > 0 ? "pointer" : "not-allowed"
                  }}
                >
                  Baixar Gabarito
                </button>
                <button
                  onClick={() => deletarProva(prova.id)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};