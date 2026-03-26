# Prova de exemplo para testes

Este arquivo traz dois exemplos de prova para cadastro manual no sistema.

## Exemplo 1: formato `letras`

Titulo: Prova de Historia

Questoes:

1. Qual foi a capital do Brasil antes de Brasilia?
   Alternativas:
   A. Salvador
   B. Rio de Janeiro
   C. Sao Paulo
   Resposta correta: `B`

2. Em que ano ocorreu a Proclamacao da Republica?
   Alternativas:
   A. 1822
   B. 1889
   C. 1930
   Resposta correta: `B`

Gabarito esperado em CSV:

```text
numero_questao,gabarito
1,B
2,B
```

## Exemplo 2: formato `potencias`

Titulo: Prova de Matematica Basica

Questoes:

1. Quanto e 2 + 2?
   Alternativas:
   1. 3
   2. 4
   4. 5
   Resposta correta: `2`

2. Quanto e 3 x 3?
   Alternativas:
   1. 6
   2. 8
   4. 9
   Resposta correta: `4`

Gabarito esperado em CSV:

```text
numero_questao,gabarito
1,2
2,4
```

## Exemplo de payload JSON para criar prova

### Formato `letras`

```json
{
  "id": "prova-historia-01",
  "titulo": "Prova de Historia",
  "alternativasFormat": "letras",
  "questoes": [
    {
      "id": "q1",
      "enunciado": "Qual foi a capital do Brasil antes de Brasilia?",
      "alternativas": ["Salvador", "Rio de Janeiro", "Sao Paulo"],
      "respostaCorreta": 1
    },
    {
      "id": "q2",
      "enunciado": "Em que ano ocorreu a Proclamacao da Republica?",
      "alternativas": ["1822", "1889", "1930"],
      "respostaCorreta": 1
    }
  ]
}
```

### Formato `potencias`

```json
{
  "id": "prova-matematica-01",
  "titulo": "Prova de Matematica Basica",
  "alternativasFormat": "potencias",
  "questoes": [
    {
      "id": "q1",
      "enunciado": "Quanto e 2 + 2?",
      "alternativas": ["3", "4", "5"],
      "respostaCorreta": 1
    },
    {
      "id": "q2",
      "enunciado": "Quanto e 3 x 3?",
      "alternativas": ["6", "8", "9"],
      "respostaCorreta": 2
    }
  ]
}
```
