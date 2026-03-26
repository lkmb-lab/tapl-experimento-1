export interface Questao {
  id: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: number;
  pontuacao?: number;
}

export interface Prova {
  id: string;
  titulo: string;
  descricao?: string;
  questoes: Questao[];
  dataCriacao?: string;
  alternativasFormat?: "letras" | "potencias";
}

export interface Resposta {
  id: string;
  provaId: string;
  respostas: number[];
  pontuacaoTotal: number;
  statusCorreacao: "corrigida";
  dataSubmissao: string;
  gabarito?: number[];
  questoes?: Questao[];
  provaFormat?: "letras" | "potencias";
}