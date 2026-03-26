# language: pt
Funcionalidade: Fluxos principais do sistema de provas
  Como responsável pelo sistema
  Quero validar os fluxos principais já implementados
  Para atender o requisito mínimo de aceitação

  Cenário: Criar uma prova
    Quando eu criar uma prova chamada "Prova de História"
    Então a resposta deve ter status 201
    E a prova criada deve aparecer na listagem

  Cenário: Editar uma prova
    Dado que existe uma prova cadastrada chamada "Prova Original"
    Quando eu atualizar essa prova para "Prova Atualizada"
    Então a resposta deve ter status 200
    E a prova atualizada deve ter o título "Prova Atualizada"

  Cenário: Excluir uma prova
    Dado que existe uma prova cadastrada chamada "Prova para excluir"
    Quando eu excluir essa prova
    Então a resposta deve ter status 200
    E a prova removida não deve aparecer na listagem

  Cenário: Gerar gabarito CSV
    Dado que existe uma prova com formato "letras" e 2 questões
    Quando eu gerar o gabarito CSV dessa prova
    Então a resposta deve ter status 200
    E o CSV deve conter o gabarito esperado

  Cenário: Corrigir respostas via CSV
    Dado que existe uma prova com formato "potencias" e 2 questões
    Quando eu enviar um arquivo CSV de respostas válido
    Então a resposta deve ter status 200
    E a correção em lote deve indicar 1 aluno corrigido com nota 2

  Cenário: Gerar PDF de provas individuais
    Dado que existe uma prova com formato "letras" e 2 questões
    Quando eu gerar 2 PDFs individuais dessa prova
    Então a resposta deve ter status 200
    E o retorno deve ser um arquivo PDF

  Cenário: Persistir metadados das versões geradas em JSON
    Dado que existe uma prova com formato "letras" e 2 questões
    Quando eu gerar 2 PDFs individuais dessa prova
    Então os metadados das versões devem ser salvos em JSON
