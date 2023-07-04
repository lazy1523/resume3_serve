FROM node:18.15.0-alpine as builder

RUN npm i -g @nestjs/cli typescript ts-node

COPY . /tmp/app/

WORKDIR /tmp/app
COPY env-example .env
RUN npm install && npm run build

FROM node:18.15.0-alpine
COPY --from=builder /tmp/app/node_modules /app/
COPY --from=builder /tmp/app/dist /app/

WORKDIR /app
COPY env-example .env

CMD ["node dist/main.js"]
