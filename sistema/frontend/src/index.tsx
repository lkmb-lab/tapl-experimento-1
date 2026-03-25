import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { ProvaList } from "./components/ProvaList";
import { ProvaForm } from "./components/ProvaForm";
import { ProvaResponder } from "./components/ProvaResponder";
import { ResultadoProva } from "./components/ResultadoProva";
import { Resposta } from "./types";

type TelaAtual = "lista" | "criar" | "responder" | "resultado";

const App = () => {
  const [telaAtual, setTelaAtual] = useState<TelaAtual>("lista");
  const [provaIdSelecionada, setProvaIdSelecionada] = useState<string>("");
  const [resultadoProva, setResultadoProva] = useState<Resposta | null>(null);

  const aoResponder = (provaId: string) => {
    setProvaIdSelecionada(provaId);
    setTelaAtual("responder");
  };

  const aoResultado = (resposta: Resposta) => {
    setResultadoProva(resposta);
    setTelaAtual("resultado");
  };

  const aoVoltarALista = () => {
    setProvaIdSelecionada("");
    setResultadoProva(null);
    setTelaAtual("lista");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {telaAtual === "lista" && (
        <ProvaList onResponder={aoResponder} onCriar={() => setTelaAtual("criar")} />
      )}

      {telaAtual === "criar" && (
        <ProvaForm
          onSalvo={() => {
            setTelaAtual("lista");
          }}
          onCancelar={() => setTelaAtual("lista")}
        />
      )}

      {telaAtual === "responder" && (
        <ProvaResponder
          provaId={provaIdSelecionada}
          onResultado={aoResultado}
          onVoltar={() => setTelaAtual("lista")}
        />
      )}

      {telaAtual === "resultado" && resultadoProva && (
        <ResultadoProva resposta={resultadoProva} onVoltarALista={aoVoltarALista} />
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);