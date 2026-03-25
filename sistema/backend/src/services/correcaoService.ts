export class CorrecaoService {
  /**
   * Corrige as respostas comparando com o gabarito
   * @param prova A prova com o gabarito
   * @param respostasDoUsuario Array de índices (0-based) das alternativas selecionadas
   * @returns pontuação total
   */
  static corrigir(prova: any, respostasDoUsuario: number[]): number {
    let pontuacao = 0;
    const questoesCount = prova.questoes.length;

    if (questoesCount === 0) {
      return 0;
    }

    // Pontuação por questão = 100 / total de questões
    const pontuacaoPorQuestao = 100 / questoesCount;

    for (let i = 0; i < prova.questoes.length; i++) {
      const questao = prova.questoes[i];
      const respostaUsuario = respostasDoUsuario[i];

      // Validar se a resposta existe
      if (respostaUsuario === undefined || respostaUsuario === null) {
        continue; // Questão não respondida = 0 pontos
      }

      // Comparar com gabarito
      if (respostaUsuario === questao.respostaCorreta) {
        pontuacao += pontuacaoPorQuestao;
      }
    }

    return Math.round(pontuacao * 100) / 100; // Arredondar a 2 casas decimais
  }
}
