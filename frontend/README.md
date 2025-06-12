# Agro Shop Frontend 🛒🌱

[![Node 18+](https://img.shields.io/badge/node-%3E%3D18.x-green)](https://nodejs.org/)
[![Vite 6](https://img.shields.io/badge/vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Aplicação **React 19 + Vite + TypeScript + Tailwind** que conecta pequenos produtores rurais a consumidores finais.  
Foco em UX mobile-first, carrinho global, checkout seguro, e painel administrativo restrito a **admins**.

## 🌐 Visão Geral

| Camada | Tecnologias | Observações |
| ------ | ----------- | ----------- |
| **UI** | React 19, React Router 6, Tailwind CSS | Componentização sem estado global pesado |
| **Estado** | Context API + localStorage | Carrinho e sessão do usuário |
| **Rede** | `fetch` + Axios ¹ | Proxy Vite → `VITE_API_BASE` |
| **Backend** | Express/Node (projeto separado) | Autenticação JWT |

<sub>¹ Axios é usado no Admin CRUD; demais chamadas usam `fetch`.</sub>

### 📊 Diagrama de Arquitetura

```mermaid
flowchart TD
  subgraph Client["React SPA"]
    Navbar -->|react-router| Routes
    Routes --> Home
    Routes --> Catalog
    Catalog -->|GET /products| API_PRODUCTS[/api/products]
    Catalog --> ProductCard
    Routes --> Cart
    Cart -->|Context| CartContext
    Routes --> Login
    Login -->|POST /auth/login| API_LOGIN[/api/auth/login]
    Routes --> Register
    Routes --> Checkout
    Checkout -->|POST /checkout| API_CHECKOUT[/api/checkout]
    Routes --> AdminProducts
    AdminProducts -->|CRUD /admin/products| API_ADMIN[/api/admin/products]
  end
  API_PRODUCTS -.-> Backend[(Express API `/api`)]
  API_LOGIN -.-> Backend
  API_CHECKOUT -.-> Backend
  API_ADMIN -.-> Backend
```

---

## 🚀 Instalação & Execução Local

```bash
git clone https://github.com/rafael-b-souza/agro-ecommerce.git
cd agro-ecommerce/frontend

# 1. Variáveis de ambiente
cp .env.example .env   # ajuste VITE_API_BASE se necessário

# 2. Dependências
npm install

# 3. Ambiente de dev com HMR
npm run dev

# 4. Build otimizado
npm run build
```

A porta padrão é **5173**. O proxy Vite redireciona chamadas que começam com `/api` para `VITE_API_BASE`.

---

## ⚙️ Variáveis de Ambiente

| Variável            | Exemplo                     | Descrição                              |
| ------------------- | --------------------------- | -------------------------------------- |
| `VITE_API_BASE`     | `http://localhost:3000`     | URL do backend Express (sem `/api`)    |
| `VITE_APP_NAME` ²   | `AgroShop`                  | (opcional) Nome mostrado no `<title>`  |

<sub>² Não usada por padrão; reservei para personalização futura.</sub>

Um template completo encontra-se em **`.env.example`**.

---

## 📦 Deploy (Netlify)

1. **Create New Site → Import from Git**  
   Selecione o repositório e defina:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Environment:** adicione `VITE_API_BASE`
2. Netlify cuidará de CDN, HTTPS e pré-renderização estática.

> **Docker** é viável, mas Netlify entrega preview URLs automáticos e zero-config — ideal para apresentação.

---

## 🤝 Contribuição

1. Crie uma *branch* a partir de `main` (`feat/minha-feature`).
2. Rode `npm run lint` antes de abrir o PR.
3. Confirme que o GitHub Actions passou.
4. Descreva **o que** e **por quê** no PR.

---

## 🗺️ Roadmap

- [ ] Testes end-to-end com Playwright
- [ ] Filtro por faixa de preço e busca textual
- [ ] Dark mode
- [ ] Integração de pagamentos reais (Stripe)
- [ ] PWA & cache offline

---

## 📜 Licença

Distribuído sob licença **MIT** — consulte `LICENSE` para detalhes.
```

---

### `.gitignore`

```gitignore
# Node / Vite
node_modules/
dist/
npm-debug.log*
yarn.lock
pnpm-lock.yaml
.env
.env.*.local
# VSCode
.vscode/
# macOS / Linux / Windows extra
.DS_Store
Thumbs.db
```

---

### `.env.example`

```dotenv
# URL base do backend (SEM /api no final)
VITE_API_BASE=http://localhost:3000
```

---

### `docs/ARCHITECTURE.md`

```markdown
# Arquitetura de Pastas & Convenções

```
src/
├─ **assets/**        · imagens estáticas se necessário  
├─ **components/**    · componentes “burros” reutilizáveis  
├─ **contexts/**      · provedores de estado global (Auth, Cart)  
├─ **pages/**         · telas mapeadas em rotas  
├─ **hooks/**         · futuros hooks customizados  
├─ **App.tsx**        · orquestra rotas/layout principal  
└─ **main.tsx**       · ponto de entrada + providers  
```

## Convenções

| Padrão | Descrição |
| ------ | --------- |
| **CSS Utility-First** | Tudo em Tailwind; classes semânticas via `@apply` se repetitivo |
| **tipagem estrita**   | `strict` no TypeScript; regra ESLint `noUncheckedSideEffectImports` |
| **fetch first**       | Use `fetch`; reserve Axios quando precisar de interceptors (Admin CRUD) |
| **camelCase**         | Para variáveis/props; **PascalCase** em componentes |
| **slug-based routing**| Rotas declaradas em `App.tsx`; admin protegido por verificação de `role` |

## Decisões de Design

- **Context API** é suficiente (escopo pequeno); evita dependência externa como Redux.
- **Proxy Vite** simplifica dev sem CORS.
- Não há **Service Worker**; futuro PWA no roadmap.
```

---

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - run: npm ci
      - run: npm run lint

      # testes são opcionais; se não existirem, não falha
      - name: Test (vitest)
        run: |
          if npm run -s | grep -q "\"test\""; then
            npm test
          else
            echo "No tests configured — skipping."
          fi

      - run: npm run build
```
