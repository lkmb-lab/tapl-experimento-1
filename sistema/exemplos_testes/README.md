# Exemplos para teste manual

Esta pasta foi criada para ajudar na revisao manual do sistema.

## Arquivos incluidos

- `prova_exemplo.md`: exemplo de prova com duas variacoes de formato de alternativas.
- `gabarito_letras.csv`: exemplo de gabarito no formato de letras.
- `gabarito_potencias.csv`: exemplo de gabarito no formato de potencias.
- `respostas_lote_letras.csv`: exemplo de arquivo CSV para correcao em lote no formato de letras.
- `respostas_lote_potencias.csv`: exemplo de arquivo CSV para correcao em lote no formato de potencias.

## Como usar

1. Inicie o backend e o frontend.
2. Cadastre manualmente uma prova usando o conteudo de `prova_exemplo.md`.
3. Gere o gabarito CSV pelo sistema e compare com os exemplos desta pasta.
4. Use um dos arquivos `respostas_lote_*.csv` na funcionalidade de correcao em lote.

## Observacao importante

Para a rota de correcao em lote funcionar, o CSV de respostas deve ter:

- a primeira coluna com o nome `aluno`
- uma coluna para cada questao da prova
- a quantidade exata de colunas esperada pelo backend

Exemplo de cabecalho para uma prova com 2 questoes:

```text
aluno,Q1,Q2
```
