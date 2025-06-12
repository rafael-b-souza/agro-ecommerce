## 1. `README.md`

```markdown
# 🛍️ E-commerce API (Node 20 + Express + TypeScript)

Serviço REST que fornece cadastro, catálogo de produtos, carrinho, checkout e painel admin.  
Banco **PostgreSQL 16**, autenticação **JWT (HS256)** e migrations SQL em `migrations/`.

## Endpoints principais
| Método | Rota                                   | Descrição                               | Auth |
| ------ | -------------------------------------- | --------------------------------------- | ---- |
| GET    | /health                                | Health-check                            | —    |
| POST   | /auth/register                         | Criar usuário                           | —    |
| POST   | /auth/login                            | Login (JWT)                             | —    |
| GET    | /products                              | Lista produtos (paginação + filtro)     | —    |
| GET    | /products/:id                          | Produto por UUID                        | —    |
| GET    | /categories                            | Lista categorias                        | —    |
| POST   | /cart                                  | Adiciona item ao carrinho               | ✔    |
| GET    | /cart                                  | Detalha carrinho                        | ✔    |
| DELETE | /cart/:itemId                          | Remove item do carrinho                 | ✔    |
| POST   | /checkout                              | Cria pedido (mock pagamento)            | ✔    |
| GET    | /admin/dashboard                       | Mensagem de boas-vindas admin           | 🔑   |
| CRUD   | /admin/products […]                    | Gerir produtos                          | 🔑   |
| GET    | /admin/orders ?status=…                | Listar pedidos                          | 🔑   |
| PUT    | /admin/orders/:id/status               | Atualizar status do pedido              | 🔑   |

*✔ = JWT de usuário* *🔑 = JWT com `role=admin`*

---

## Sequence diagram

```mermaid
sequenceDiagram
  participant C as Client
  participant API as Express API
  participant DB as PostgreSQL
  C->>API: Requisição HTTP (JSON/JWT)
  API->>DB: SQL query
  DB-->>API: Resultados
  API-->>C: Resposta JSON
```

---

## Subindo tudo via **Docker Compose**

```bash
git clone https://github.com/rafael-b-souza/agro-ecommerce.git
cd agro-ecommerce/backend
cp .env.example .env      # ajuste credenciais/portas se quiser

docker compose up --build -d   # API + Postgres
```

A API ficará em `http://localhost:${API_PORT:-3000}`; o Postgres em `${PG_PORT:-5432}`.

### Executar migrations

```bash
npm run migrate           # aplica SQL em migrations/ na DATABASE_URL
```

---

## Variáveis de ambiente

| Chave            | Exemplo                                | Observação |
| ---------------- | -------------------------------------- | ---------- |
| `API_PORT`       | 3000                                   | Porta da API              |
| `JWT_SECRET`     | (gerar com `openssl rand -base64 32`)  | Segredo HS256             |
| `POSTGRES_USER`  | ecom_user                              | Usado no container DB     |
| `POSTGRES_PASSWORD` | superSenha                          | —                         |
| `POSTGRES_DB`    | ecommerce_mvp                          | —                         |
| `PG_PORT`        | 5432                                   | Porta exposta do DB       |
| `DATABASE_URL`   | postgres://user:pass@host:5432/db      | String completa p/ Pool   |

> Gere um `JWT_SECRET` novo antes do deploy.

---

## Guia rápido de deploy

### Docker (qualquer VPS)

```bash
docker build -t ecommerce-api .
docker run -d --env-file .env -p 80:3000 ecommerce-api
```

### Render.com (free tier)

1. Crie **Database → PostgreSQL 16** e copie o `DATABASE_URL`.  
2. Crie **Web Service** a partir deste repo, build: `docker build -t backend .`  
3. Defina variáveis `.env` no painel → *Environment*.  
4. Pronto! O health-check `/health` precisa retornar HTTP 200.

---

## Contribuição

1. Fork → branch → PR.  
2. Rode `npm run lint && npm test` antes de enviar.  
3. Descreva claramente sua mudança.

## Licença

[MIT](LICENSE) – use livremente 😊
```

---

## 2. `.gitignore`

```gitignore
# Node
node_modules/
dist/
.env
npm-debug.log*
yarn-error.log*

# Editor / OS
.idea/
.vscode/
.DS_Store

# Docker
*.local
docker-compose.override.yml
```

---

## 3. `.env.example`

```dotenv
# API
API_PORT=3000
JWT_SECRET=changeme-before-prod

# PostgreSQL
PG_PORT=5432
POSTGRES_USER=ecom_user
POSTGRES_PASSWORD=superSenha
POSTGRES_DB=ecommerce_mvp
DATABASE_URL=postgresql://ecom_user:superSenha@localhost:5432/ecommerce_mvp
```

---

## 4. `docs/API.md` (referência rápida)

```markdown
# Referência REST

## Autenticação
### POST /auth/register
```json
{ "email": "user@ex.com", "password": "123456", "full_name": "Nome" }
```
*201* → `{ user }`   *400/409* erros.

### POST /auth/login
```json
{ "email": "user@ex.com", "password": "123456" }
```
*200* → `{ token, expires_in }`   *401* inválido.

## Produtos
| Método | Endpoint                 | Query/body                 | Auth | Resp |
| ------ | ------------------------ | -------------------------- | ---- | ---- |
| GET    | /products                | `page`, `limit`, `category`| —    | 200  |
| GET    | /products/:id            | —                          | —    | 200/404 |

## Carrinho
| POST /cart | `{ productId, quantity }` | ✔ | 201/400 |
| GET /cart  | — | ✔ | 200 |
| DELETE /cart/:itemId | — | ✔ | 204/404 |

## Checkout
| POST /checkout | — | ✔ | 201/400 |

## Admin – Produtos & Pedidos
Requer `role=admin` no JWT. Endpoints em `/admin/products` e `/admin/orders` seguem CRUD/REST completo.
```

*(Caso prefira Swagger, basta importar este Markdown num gerador, mas o professor geralmente lê mais rápido em tabela.)*

---

## 5. `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    paths:
      - "src/**"
      - "package*.json"
      - ".github/workflows/backend-ci.yml"
  pull_request:

jobs:
  build-test-lint:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run lint       # eslint + prettier
      - run: npm run build      # tsc

      # Se houver testes:
      # - run: npm test
```
