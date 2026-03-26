# Revisão do Sistema do Colega

## Identificação
- Repositório revisado: https://github.com/fernandasales27/Agentes
- Data da revisão: 26/03/2026
- Revisor: Larissa Kischenah Magalhães Bezerra

## Resumo da avaliação
O repositório apresenta uma implementação funcional do experimento com frontend em React + TypeScript, backend em Node.js + TypeScript e testes de aceitação com Cucumber. Há evidências concretas de funcionamento do fluxo principal no backend, geração de PDF, exportação de gabarito CSV, correção e relatório. Entretanto, a qualidade da validação automatizada é limitada porque os cenários Cucumber simulam a lógica em memória nos próprios steps, sem exercer a API real nem a interface. Além disso, o histórico de uso de agente não está suficientemente documentado no repositório.

## Pontos fortes
- A estrutura solicitada pelo experimento foi respeitada: `sistema/frontend`, `sistema/backend` e `sistema/cucumber`.
- A stack está clara e coerente com o enunciado: React 18, Vite, Express, TypeScript, PDFKit e Cucumber.
- O backend separa rotas HTTP, serviços e tipos de domínio.
- Há validação de entrada em endpoints principais de questões, provas e correção.
- O fluxo principal do backend funcionou em runtime com evidências objetivas de criação, geração, exportação e correção.
- O projeto compilou no backend e no frontend.
- Os testes Cucumber executaram com sucesso no ambiente avaliado.

## Problemas encontrados
- Problema: De antemão, pode ser devido a falta de experiêmcia de qume o está fazendo a revisão do projeto. Mas, os testes Cucumber com apoio de IA,  não validaram o sistema real; eles reimplementam regras em memória dentro de `sistema/cucumber/features/step_definitions/provas.steps.ts`.
- Impacto: Os testes passam mesmo que haja divergência entre a implementação real do backend/frontend e o comportamento descrito nos cenários.
- Evidência (arquivo, função, teste, tela ou comando): arquivo `sistema/cucumber/features/step_definitions/provas.steps.ts`; comando `npm run test:acceptance` retornou `13 scenarios (13 passed)` e `53 steps (53 passed)`, mas os steps não fazem chamadas HTTP para `sistema/backend/src/app.ts`.
- Sugestão: Reescrever os steps para consumir a API real ou testar o fluxo pela interface, usando o backend executando de fato durante a suíte.

- Problema: Pode ser devido a falta de experiência na área mas, o agente revisor identificou que o frontend concentra a maior parte da lógica em um único componente grande.
- Impacto: A manutenção, leitura, testes e evolução da interface ficam mais difíceis, especialmente em operações de CRUD, geração e correção.
- Evidência (arquivo, função, teste, tela ou comando): `sistema/frontend/src/App.tsx` possui 1137 linhas e reúne estado, layout, chamadas HTTP e regras de fluxo em um único arquivo.
- Sugestão: Separar a aplicação em componentes, hooks e serviços de API por responsabilidade.

- Problema: A correção proporcional apresenta evidência de comportamento questionável no fluxo numérico.
- Impacto: O requisito de correção proporcional parece implementado, mas sua aderência à ideia de “acertos de marcação/desmarcação” não ficou plenamente demonstrada.
- Evidência (arquivo, função, teste, tela ou comando): em `sistema/backend/src/services/correcaoService.ts`, a função `notaQuestaoProporcional` usa diferença relativa para valores numéricos; na validação em runtime, `POST /api/correcoes` com payload `{"modo":"PROPORCIONAL","gabaritoCsv":"numeroProva,q1\n1,2","respostasCsv":"identificadorAluno,numeroProva,q1\naluno1,1,0"}` retornou status `201`, mas a nota observada foi `0`, não uma nota parcial.
- Sugestão: Revisar a regra proporcional para respostas em formato `POTENCIAS_2` e adicionar testes cobrindo casos parcialmente corretos na implementação real.

## Cobertura dos requisitos
- CRUD de questões: Sim
- CRUD de provas: Sim
- Geração de provas/PDF: Sim
- Gabarito CSV: Sim
- Correção rigorosa/proporcional: Parcial
- Relatório de notas: Sim
- Testes de aceitação com Cucumber: Sim

## O sistema está funcionando com as funcionalidades solicitadas?
Sim, com ressalvas. Há evidências de que o sistema compila e que o backend executa um fluxo real das funcionalidades principais. Os comandos executados foram:

```text
npm install          (em sistema/backend, sistema/frontend e sistema/cucumber)
npm run build        (em sistema/backend)
npm run build        (em sistema/frontend)
npm run test:acceptance   (em sistema/cucumber)
```

Resultados observados:

```text
backend build: sucesso
frontend build: sucesso
cucumber: 13 scenarios (13 passed), 53 steps (53 passed)
```

Na validação em runtime com o backend iniciado temporariamente por `node dist/server.js`, foram observadas as seguintes evidências:

```text
GET /health -> status lógico ok
POST /api/questoes -> criou questão
POST /api/provas -> criou prova
POST /api/provas/:id/geracoes -> gerou lote
GET /api/geracoes/:id/gabarito-csv -> retornou:
numeroProva,q1
1,A
2,A
GET /api/geracoes/:id/pdf -> gerou PDF com 3468 bytes
POST /api/correcoes/validar-csv -> valido=true
POST /api/correcoes -> criou correção
GET /api/correcoes/:id/relatorio -> 2 resultados
GET /api/correcoes/:id/relatorio-csv -> retornou:
identificadorAluno,numeroProva,notaTotal
aluno1,1,0
aluno2,2,10
```

Também houve uma segunda validação curta focada em evidência HTTP:

- `PUT /api/questoes/{id}` com status `200`: a questão foi atualizada para `Questao editada`.
- `PUT /api/provas/{id}` com status `200`: a prova foi atualizada para `Prova Editada`.
- `DELETE /api/provas/{id}` com status `204`: exclusão confirmada.
- `DELETE /api/questoes/{id}` com status `204`: exclusão confirmada.
- `POST /api/correcoes/validar-csv` com CSV inválido retornou status `422` e erro: `CSV de respostas deve conter colunas identificadorAluno e numeroProva.`

Portanto, o sistema demonstra funcionamento prático das funcionalidades centrais. A principal ressalva é que os testes de aceitação não comprovam esse funcionamento porque não exercem a aplicação real.

## Quais os problemas de qualidade do código e dos testes?
Os principais problemas de qualidade observados foram:

1. Os testes de aceitação não são de ponta a ponta (recomendável).
Evidência: `sistema/cucumber/features/step_definitions/provas.steps.ts` implementa lógica própria de cadastro, geração, CSV, correção e “PDF”, em vez de chamar a API real.

2. O frontend está pouco modularizado.
Evidência: `sistema/frontend/src/App.tsx` concentra 1137 linhas com interface, estado, validações locais e integração HTTP.

3. Há cobertura insuficiente das regras críticas de correção no código real.
Evidência: não há suíte de testes unitários do backend para `sistema/backend/src/services/correcaoService.ts`; a validação encontrada está concentrada no Cucumber simulado.

4. A persistência é apenas em memória.
Evidência: `sistema/backend/src/repositories/inMemoryStore.ts` mantém `questoes`, `provas`, `geracoes` e `correcoes` em arrays locais, o que significa perda dos dados ao reiniciar o servidor.


## Revisão do histórico do desenvolvimento
1. Estratégias de interação utilizada

Pelo que foi possível observar, o desenvolvimento parece ter seguido uma estratégia relativamente estruturada: o repositório inclui requisitos, backlog inicial, modelo de dados, cenários de aceitação, endpoints sugeridos, checklist de entrega e um arquivo `AGENTS.md`. Isso sugere preocupação em orientar o agente com contexto e restrições antes da implementação. Também há commits curtos e incrementais entre 24/03/2026 e 25/03/2026.

2. Situações em que o agente funcionou melhor ou pior

O agente aparentemente funcionou melhor na geração rápida da base do projeto e na expansão de funcionalidades visíveis, especialmente interface, fluxo geral e artefatos auxiliares. Os commits mostram evolução incremental em frontend, correções e documentação. Por outro lado, a parte de validação parece ter funcionado pior: embora exista Cucumber, os steps não se conectam ao sistema real, o que indica que o agente pode ter produzido testes mais demonstrativos do que verificadores.

3. Tipos de problemas observados

Os problemas mais visíveis foram:

- validação automatizada fraca para o sistema real;
- concentração de lógica no frontend;
- documentação insuficiente do uso de agente;
- possível fragilidade conceitual na correção proporcional para respostas numéricas.

4. Avaliação geral da utilidade do agente no desenvolvimento

Com base apenas no que está versionado, o agente parece ter sido útil para acelerar a construção inicial do sistema, da interface e da organização dos artefatos do experimento. O resultado final é funcional e relativamente completo para o escopo pedido. Porém, a utilidade do agente foi mais convincente na produção da solução do que na produção de evidências fortes de qualidade e rastreabilidade do processo.

5. Comparação com a minha experiência de uso do agente

A comparação foi moderada, porque o repositório não traz histórico preenchido de prompts e ajustes ao longo do desenvolvimento. Ainda assim, pelo conjunto de artefatos, pela sequência de commits e pela organização do material, o colega aparenta ter usado o agente de forma mais estruturada e com maior domínio técnico do que a experiência típica de uma revisora com menor familiaridade com programação. Isso aparece principalmente na definição prévia de arquitetura, separação de módulos e consolidação rápida de frontend, backend e Cucumber.

Por outro lado, essa impressão não pode ser tratada como certeza sobre o processo real, porque faltam evidências diretas do histórico de interação com o agente. Assim, a comparação mais segura é: o repositório sugere uso relativamente eficiente do agente para construir a solução, mas não documenta suficientemente o processo para permitir uma conclusão forte sobre como esse uso ocorreu na prática.
