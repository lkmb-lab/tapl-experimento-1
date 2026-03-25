import { Prova, Resposta } from "../types";

const API_BASE = "http://localhost:3000/api";

export const apiService = {
  // Provas
  async getProvas(): Promise<Prova[]> {
    const res = await fetch(`${API_BASE}/provas`);
    return res.json();
  },

  async getProva(id: string): Promise<Prova> {
    const res = await fetch(`${API_BASE}/provas/${id}`);
    return res.json();
  },

  async criarProva(prova: Prova): Promise<Prova> {
    const res = await fetch(`${API_BASE}/provas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prova)
    });
    return res.json();
  },

  async atualizarProva(id: string, prova: Prova): Promise<Prova> {
    const res = await fetch(`${API_BASE}/provas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prova)
    });
    return res.json();
  },

  // Respostas
  async submeterRespostas(provaId: string, respostas: number[]): Promise<Resposta> {
    const res = await fetch(`${API_BASE}/respostas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provaId, respostas })
    });
    return res.json();
  },

  async obterResposta(id: string): Promise<Resposta> {
    const res = await fetch(`${API_BASE}/respostas/${id}`);
    return res.json();
  }
};
