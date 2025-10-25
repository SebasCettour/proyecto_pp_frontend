# -----------------------
# Etapa de desarrollo
# -----------------------
FROM node:20 AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# 👇 Vite necesita --host 0.0.0.0 dentro de Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# -----------------------
# Etapa de build (producción)
# -----------------------
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# -----------------------
# Etapa de producción
# -----------------------
FROM node:20 AS prod

WORKDIR /app

COPY --from=build /app/dist ./dist
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
