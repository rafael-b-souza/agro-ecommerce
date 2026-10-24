# Dockerfile
FROM node:20-alpine AS base

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os manifests primeiro para aproveitar cache de camadas
COPY package*.json ./

# Instala dependências (–production= false garante dev-deps em build)
RUN npm ci

# Copia o restante do código
COPY . .

# Compila TypeScript para JavaScript em dist/
RUN npm run build

# =================  Stage de execução  ==============
FROM node:20-alpine

WORKDIR /app

# Copia apenas artefatos já construídos
COPY --from=base /app/package*.json ./
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

# Variável de ambiente padrão (pode ser sobrescrita no compose ou Vercel)
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "dist/index.js"]
