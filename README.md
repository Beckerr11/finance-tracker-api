# Finance Tracker API

API REST de controle financeiro pessoal construída com **Node.js, Express 5, MongoDB/Mongoose e JWT**. O foco deste repositório é demonstrar backend com autenticação, isolamento por usuário, agregações financeiras e um pipeline de qualidade reproduzível.

## O que está implementado

### Autenticação
- cadastro de usuário;
- login com e-mail e senha;
- hash de senha com bcrypt;
- JWT com expiração configurável;
- endpoint autenticado `/me`;
- proteção de rotas via Bearer token;
- conflito `409` para e-mail duplicado.

### Transações
- criação, leitura, atualização e remoção de receitas/despesas;
- vínculo obrigatório ao usuário autenticado;
- filtros por tipo, categoria e período;
- paginação e ordenação;
- campos como tags, recorrência e data.

### Resumos financeiros
- resumo mensal;
- breakdown por categoria;
- visão anual;
- pipelines de agregação no MongoDB.

### Camada HTTP
- Helmet;
- CORS configurável;
- rate limiting nas rotas `/api`;
- limite de payload JSON;
- tratamento de erros centralizado;
- health check em `/health`;
- fallback `404` compatível com Express 5.

## Stack

| Área | Tecnologia |
| --- | --- |
| Runtime | Node.js 24 no CI |
| API | Express 5 |
| Banco | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validação | express-validator |
| Segurança HTTP | Helmet, CORS, express-rate-limit |
| Testes | Jest + Supertest |
| Infra | Docker + GitHub Actions |

## Executando localmente

```bash
git clone https://github.com/Beckerr11/finance-tracker-api.git
cd finance-tracker-api
npm ci
cp .env.example .env
npm start
```

Exemplo de ambiente:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/finance-tracker
JWT_SECRET=troque-por-um-segredo-forte
JWT_EXPIRES_IN=7d
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:3000
```

Nenhuma credencial real deve ser versionada.

## Contrato principal

### Auth

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Transactions

```text
POST   /api/v1/transactions
GET    /api/v1/transactions
GET    /api/v1/transactions/:id
PATCH  /api/v1/transactions/:id
DELETE /api/v1/transactions/:id
```

### Summary

```text
GET /api/v1/summary/monthly
GET /api/v1/summary/category
GET /api/v1/summary/yearly
```

As rotas de transações e resumo exigem autenticação.

## Verificação automatizada

O workflow de CI sobe um **MongoDB 7 isolado** e executa:

```text
npm ci
→ testes Jest/Supertest
→ npm audit --omit=dev --audit-level=high
→ docker build
```

A suíte de autenticação verifica cadastro, senha fora da resposta, e-mail duplicado, validação de senha, login válido/inválido e acesso autenticado a `/me`.

O repositório também fixa uma versão corrigida de `ip-address` por `overrides` para não aceitar a cadeia vulnerável reportada pelo npm audit.

## Arquitetura

```text
src/
├── app.js
├── server.js
├── controllers/
│   ├── auth.controller.js
│   ├── transaction.controller.js
│   └── summary.controller.js
├── models/
│   ├── User.model.js
│   └── Transaction.model.js
├── routes/
│   ├── auth.routes.js
│   ├── transaction.routes.js
│   └── summary.routes.js
├── middlewares/
│   ├── auth.middleware.js
│   └── error.middleware.js
└── __tests__/
    ├── auth.controller.test.js
    └── setup.js
```

## Decisões e limites

- O projeto usa **um access token JWT**; refresh token não é apresentado como recurso atual.
- Conversão automática de moedas, integração bancária e frontend não fazem parte desta versão.
- O CI testa diretamente o fluxo de autenticação; transações e agregações existem no código, mas ampliar a cobertura automatizada dessas áreas permanece uma evolução desejável.
- A configuração de produção depende de uma instância MongoDB e de segredos fornecidos pelo ambiente.

## Roadmap

- ampliar testes HTTP para CRUD de transações e agregações;
- metas e alertas de gastos;
- múltiplas moedas;
- observabilidade;
- frontend separado;
- deploy público de demonstração.

## Autor

**Douglas Silva**  
[GitHub](https://github.com/Beckerr11) · [Portfólio](https://douglasdev.tech)

## Licença

MIT.
