FROM node:18.15.0-alpine as builder

RUN npm i -g @nestjs/cli typescript ts-node

WORKDIR /tmp/app
COPY . .

RUN npm install && npm run build

FROM node:18.15.0-alpine as node_modules

WORKDIR /tmp/app
COPY . .

RUN npm ci --only=production

FROM node:18.15.0-alpine
WORKDIR /app
COPY --from=node_modules /tmp/app/node_modules ./node_modules
COPY --from=builder /tmp/app/dist ./dist
