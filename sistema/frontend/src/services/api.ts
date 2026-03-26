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

  async deletarProva(id: string): Promise<void> {
    await fetch(`${API_BASE}/provas/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });
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
  },

  async downloadGabarito(provaId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/provas/${provaId}/gabarito/csv`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gabarito_prova_${provaId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};