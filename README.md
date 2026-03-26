# tapl-experimento-1

Projeto da disciplina de Topicos Avancados em Linguagens de Programacao para desenvolvimento de um sistema web com frontend em React + TypeScript e backend em Node.js + TypeScript.

## Objetivo

O sistema permite cadastrar provas objetivas, responder provas, corrigir respostas automaticamente e apoiar a aplicacao com geracao de gabaritos, correcao em lote por CSV e geracao de multiplas versoes em PDF.

## Requisitos para execucao local

- Node.js 18+ recomendado.
- npm 9+ recomendado.
- Navegador web atualizado.

Observacao: o projeto nao declara a chave `engines` nos `package.json`, entao as versoes acima sao uma recomendacao pratica para executar o stack atual sem incompatibilidades comuns.

## Estrutura do projeto

```text
.
|-- sistema/
|   |-- backend/
|   |-- frontend/
|-- README.md
```

- `sistema/frontend`: interface web em React com Vite e TypeScript.
- `sistema/backend`: API em Express com TypeScript e persistencia simples em arquivos JSON.

## Funcionalidades implementadas

- Cadastro, listagem, edicao e exclusao de provas.
- Resposta de provas pela interface.
- Correcao automatica com calculo de pontuacao.
- Visualizacao detalhada do resultado de cada submissao.
- Exportacao de gabarito em CSV.
- Correcao em lote por upload de CSV.
- Geracao de multiplas versoes da mesma prova em PDF, com embaralhamento de questoes e alternativas.
- Registro das versoes geradas para consulta posterior.
- Testes de aceitacao com Cucumber no backend.

## Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript
- Multer
- PDFKit
- Cucumber

## Dependencias principais e versoes

### Backend

- `express`: `^4.18.2`
- `cors`: `^2.8.5`
- `multer`: `^1.4.5-lts.1`
- `pdfkit`: `^0.13.0`
- `typescript`: `^5.0.0`
- `ts-node`: `^10.9.1`
- `@cucumber/cucumber`: `^10.8.0`
- `supertest`: `^7.2.2`

### Frontend

- `react`: `^18.2.0`
- `react-dom`: `^18.2.0`
- `vite`: `^4.0.0`
- `typescript`: `^5.0.0`
- `@vitejs/plugin-react`: `^4.0.0`

## Como instalar

### 1. Clonar o repositorio

```bash
git clone <url-do-repositorio>
cd tapl-experimento-1
```

### 2. Instalar dependencias do backend

```bash
cd sistema/backend
npm install
```

### 3. Instalar dependencias do frontend

Em outro terminal, ou apos concluir a instalacao do backend:

```bash
cd sistema/frontend
npm install
```

## Como executar o projeto

O backend e o frontend devem ser executados em terminais separados.

### Backend

Na pasta `sistema/backend`:

```bash
npm run dev
```

Servidor:

```text
http://localhost:3000
```

### Frontend

Na pasta `sistema/frontend`:

```bash
npm run dev
```

URL local esperada:

```text
http://localhost:5173
```

## Como executar os testes

Na pasta `sistema/backend`:

```bash
npm run test:acceptance
```

## Material para teste manual

A pasta `sistema/exemplos_testes` contem arquivos de apoio para validacao manual:

- exemplo de prova em Markdown
- exemplos de gabarito em CSV
- exemplos de respostas em CSV para correcao em lote

Esses arquivos podem ser usados pela pessoa revisora para cadastrar uma prova e testar as rotas de gabarito, correcao em lote e validacao da interface.

## Fluxo basico de uso

1. Iniciar o backend.
2. Iniciar o frontend.
3. Criar uma prova com titulo, questoes e alternativas.
4. Responder a prova pela interface.
5. Visualizar a correcao automatica.
6. Opcionalmente gerar gabarito CSV, corrigir em lote por CSV ou gerar versoes em PDF.

## Observacoes para avaliacao

- O backend utiliza arquivos JSON para persistencia simples dos dados.
- Durante o uso da aplicacao podem ser gerados arquivos auxiliares, como PDFs e registros de provas geradas.
- Para revisao do codigo, os arquivos mais importantes estao em `sistema/frontend/src`, `sistema/backend/src` e `sistema/backend/tests`.
