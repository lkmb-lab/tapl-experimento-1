import React, { useState, useEffect } from "react";
import { Prova, Resposta } from "../types";
import { apiService } from "../services/api";

interface ProvaResponderProps {
  provaId: string;
  onResultado: (resposta: Resposta) => void;
  onVoltar: () => void;
}

export const ProvaResponder: React.FC<ProvaResponderProps> = ({
  provaId,
  onResultado,
  onVoltar
}) => {
  const [prova, setProva] = useState<Prova | null>(null);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const carregarProva = async () => {
      try {
        const data = await apiService.getProvas();
        const provaEncontrada = data.find((p) => p.id === provaId);
        if (provaEncontrada) {
          setProva(provaEncontrada);
          setRespostas(new Array(provaEncontrada.questoes.length).fill(-1));
        }
      } catch (error) {
        console.error("Erro ao carregar prova:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarProva();
  }, [provaId]);

  const selecionarAlternativa = (questaoIndex: number, alternativaIndex: number) => {
    const novasRespostas = [...respostas];
    novasRespostas[questaoIndex] = alternativaIndex;
    setRespostas(novasRespostas);
  };

  const verificarTodasRespondidas = () => {
    return respostas.every((r) => r !== -1);
  };

  const submeterRespostas = async () => {
    if (!verificarTodasRespondidas()) {
      alert("Por favor, responda todas as questões!");
      return;
    }

    setEnviando(true);
    try {
      const resultado = await apiService.submeterRespostas(provaId, respostas);
      onResultado(resultado);
    } catch (error) {
      console.error("Erro ao submeter respostas:", error);
      alert("Erro ao submeter respostas");
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) return <div>Carregando prova...</div>;
  if (!prova) return <div>Prova não encontrada</div>;

  const porcentagemCompleto = prova.questoes.length > 0 
    ? Math.round((respostas.filter((r) => r !== -1).length / prova.questoes.length) * 100)
    : 0;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>{prova.titulo}</h2>
      <p>Progresso: {porcentagemCompleto}% ({respostas.filter((r) => r !== -1).length}/{prova.questoes.length})</p>

      <div style={{ marginBottom: "20px" }}>
        {prova.questoes.map((questao, index) => (
          <div
            key={questao.id}
            style={{
              marginBottom: "25px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: respostas[index] !== -1 ? "#f0f8ff" : "white"
            }}
          >
            <h4>
              Questão {index + 1} {respostas[index] !== -1 && "✓"}
            </h4>
            <p style={{ fontSize: "16px", marginBottom: "15px" }}>{questao.enunciado}</p>

            <div style={{ marginLeft: "20px" }}>
              {questao.alternativas.map((alt, altIndex) => (
                <label
                  key={altIndex}
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    cursor: "pointer",
                    padding: "8px",
                    backgroundColor: respostas[index] === altIndex ? "#e0e0e0" : "transparent",
                    borderRadius: "3px"
                  }}
                >
                  <input
                    type="radio"
                    name={`questao-${index}`}
                    checked={respostas[index] === altIndex}
                    onChange={() => selecionarAlternativa(index, altIndex)}
                    style={{ marginRight: "10px", cursor: "pointer" }}
                  />
                  {alt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={onVoltar}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ccc",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Voltar
        </button>
        <button
          onClick={submeterRespostas}
          disabled={!verificarTodasRespondidas() || enviando}
          style={{
            padding: "10px 20px",
            backgroundColor: verificarTodasRespondidas() ? "#28a745" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: verificarTodasRespondidas() ? "pointer" : "not-allowed"
          }}
        >
          {enviando ? "Enviando..." : "Submeter Respostas"}
        </button>
      </div>
    </div>
  );
};
