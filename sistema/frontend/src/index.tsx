import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { ProvaList } from "./components/ProvaList";
import { ProvaForm } from "./components/ProvaForm";
import { ProvaResponder } from "./components/ProvaResponder";
import { ResultadoProva } from "./components/ResultadoProva";
import { Resposta, Prova } from "./types";

type TelaAtual = "lista" | "criar" | "editar" | "responder" | "resultado";

const App = () => {
  const [telaAtual, setTelaAtual] = useState<TelaAtual>("lista");
  const [provaIdSelecionada, setProvaIdSelecionada] = useState<string>("");
  const [provaEdicao, setProvaEdicao] = useState<Prova | null>(null);
  const [resultadoProva, setResultadoProva] = useState<Resposta | null>(null);

  const aoResponder = (provaId: string) => {
    setProvaIdSelecionada(provaId);
    setTelaAtual("responder");
  };

  const aoEditar = (prova: Prova) => {
    setProvaEdicao(prova);
    setTelaAtual("editar");
  };

  const aoResultado = (resposta: Resposta) => {
    setResultadoProva(resposta);
    setTelaAtual("resultado");
  };

  const aoVoltarALista = () => {
    setProvaIdSelecionada("");
    setProvaEdicao(null);
    setResultadoProva(null);
    setTelaAtual("lista");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {telaAtual === "lista" && (
        <ProvaList 
          onResponder={aoResponder} 
          onCriar={() => setTelaAtual("criar")} 
          onEditar={aoEditar}
        />
      )}

      {telaAtual === "criar" && (
        <ProvaForm
          onSalvo={() => {
            setTelaAtual("lista");
          }}
          onCancelar={() => setTelaAtual("lista")}
          provaEditar={null}
        />
      )}

      {telaAtual === "editar" && (
        <ProvaForm
          onSalvo={() => {
            setTelaAtual("lista");
          }}
          onCancelar={() => setTelaAtual("lista")}
          provaEditar={provaEdicao}
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