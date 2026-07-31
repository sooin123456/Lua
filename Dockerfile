FROM node:24-bookworm-slim

WORKDIR /app
COPY package.json ./
COPY apps ./apps
COPY packages ./packages

CMD ["node", "apps/gateway.mjs"]
