# Finance Tracker API

Uma API REST robusta e escalável para controle financeiro pessoal, construída com **Node.js**, **Express** e **MongoDB**. Perfeita para demonstrar conhecimento de backend profissional.

## 🎯 Características

- **Autenticação JWT** com tokens de acesso e refresh tokens
- **CRUD completo** de transações (receitas e despesas)
- **Agregações MongoDB** para resumos e análises financeiras
- **Filtros avançados** por período, categoria, tipo de transação
- **Paginação** eficiente para grandes volumes de dados
- **Validação robusta** com express-validator
- **Segurança** com helmet, CORS, rate limiting
- **Tratamento de erros** centralizado e padronizado
- **Testes unitários** com Jest

## 🚀 Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Banco de Dados** | MongoDB + Mongoose |
| **Autenticação** | JWT (jsonwebtoken) |
| **Validação** | express-validator |
| **Segurança** | helmet, CORS, bcryptjs, rate-limit |
| **Testes** | Jest, Supertest |
| **Dev Tools** | Nodemon |

## 📋 Instalação

```bash
# Clone o repositório
git clone https://github.com/Beckerr11/finance-tracker-api.git
cd finance-tracker-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor
npm start
```

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/finance-tracker
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:3000
```

## 📚 Documentação da API

### Autenticação

#### Registrar novo usuário
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Douglas Silva",
  "email": "douglas@example.com",
  "password": "senha123",
  "currency": "BRL",
  "monthlyBudget": 5000
}
```

**Resposta (201):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Douglas Silva",
      "email": "douglas@example.com",
      "currency": "BRL",
      "monthlyBudget": 5000
    }
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "douglas@example.com",
  "password": "senha123"
}
```

### Transações

#### Criar transação
```http
POST /api/v1/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "expense",
  "amount": 150.50,
  "description": "Compras no supermercado",
  "category": "Alimentação",
  "date": "2024-06-24",
  "tags": ["groceries", "weekly"],
  "isRecurring": false
}
```

#### Listar transações com filtros
```http
GET /api/v1/transactions?type=expense&category=Alimentação&page=1&limit=20&sort=-date
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` — `income` ou `expense`
- `category` — Nome da categoria
- `startDate` — Data inicial (YYYY-MM-DD)
- `endDate` — Data final (YYYY-MM-DD)
- `page` — Número da página (padrão: 1)
- `limit` — Itens por página (padrão: 20)
- `sort` — Campo para ordenação (ex: `-date`, `amount`)

#### Obter resumo mensal
```http
GET /api/v1/summary/monthly?year=2024&month=6
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "period": { "year": 2024, "month": 6 },
    "income": 5000,
    "expense": 2150.50,
    "balance": 2849.50,
    "savingsRate": "56.99",
    "transactionCount": 42,
    "monthlyBudget": 5000,
    "budgetUsed": "43.01"
  }
}
```

#### Análise por categoria
```http
GET /api/v1/summary/category?year=2024&month=6&type=expense
Authorization: Bearer {token}
```

## 🏗️ Arquitetura

```
src/
├── app.js                 # Configuração do Express
├── server.js              # Entry point
├── controllers/           # Lógica de negócio
│   ├── auth.controller.js
│   ├── transaction.controller.js
│   └── summary.controller.js
├── models/                # Schemas MongoDB
│   ├── User.model.js
│   └── Transaction.model.js
├── routes/                # Definição de rotas
│   ├── auth.routes.js
│   ├── transaction.routes.js
│   └── summary.routes.js
└── middlewares/           # Middlewares customizados
    ├── auth.middleware.js
    └── error.middleware.js
```

### Padrões de Código

**Tratamento de Erros Centralizado:**
Todos os controllers usam `catchAsync` para envolver funções assíncronas e capturar erros automaticamente:

```javascript
exports.createTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.create({ ...req.body, user: req.user._id })
  res.status(201).json({ status: 'success', data: { transaction } })
})
```

**Autenticação com JWT:**
Middleware `protect` valida o token em todas as rotas protegidas:

```javascript
router.use(protect) // Todas as rotas abaixo requerem autenticação
```

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Rodar com cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

## 📊 Agregações MongoDB

A API usa `aggregation pipelines` do MongoDB para análises eficientes:

- **Resumo Mensal:** Agrupa transações por tipo (income/expense)
- **Breakdown por Categoria:** Calcula percentuais e totais por categoria
- **Overview Anual:** Mostra tendências mês a mês

Exemplo de pipeline:
```javascript
db.transactions.aggregate([
  { $match: { user: ObjectId("..."), date: { $gte: startDate } } },
  { $group: { _id: "$category", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])
```

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (12 rounds)
- ✅ JWT com expiração configurável
- ✅ CORS restritivo
- ✅ Helmet para headers de segurança
- ✅ Rate limiting (100 req/15min)
- ✅ Validação de entrada com express-validator
- ✅ Isolamento de dados por usuário

## 🚢 Deploy

### Render (Backend)
```bash
# Conecte seu repositório GitHub ao Render
# Configure as variáveis de ambiente no painel
# Deploy automático a cada push para main
```

### MongoDB Atlas (Banco de Dados)
```bash
# Crie um cluster gratuito em mongodb.com/cloud
# Gere uma connection string
# Adicione à variável MONGODB_URI
```

## 📈 Próximos Passos

- [ ] Adicionar suporte a múltiplas moedas com conversão automática
- [ ] Implementar metas e alertas de gastos
- [ ] Adicionar integração com Plaid para importar transações bancárias
- [ ] Criar dashboard com gráficos (frontend React)
- [ ] Implementar backup automático de dados

## 👨‍💻 Autor

**Douglas Silva** — Desenvolvedor Full Stack Júnior  
📧 douglasaparecidodasilva@gmail.com  
🔗 [GitHub](https://github.com/Beckerr11) | [Portfolio](https://douglasdev.tech)

## 📄 Licença

MIT License — Sinta-se livre para usar este projeto como referência ou base para seus próprios projetos.

---

**Desenvolvido com ❤️ para demonstrar conhecimento de backend profissional**
