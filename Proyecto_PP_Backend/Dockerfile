# ===========================
# Etapa de desarrollo
# ===========================
FROM node:20 AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]

# ===========================
# Etapa de producción
# ===========================
FROM node:20 AS prod

WORKDIR /app


COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY . .


RUN npm run build
# Opcional: eliminar devDependencies para imagen final más liviana
RUN npm prune --production

EXPOSE 4000

CMD ["node", "dist/server.js"]