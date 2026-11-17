FROM node:22-alpine AS builder 

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./


RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:dev"]