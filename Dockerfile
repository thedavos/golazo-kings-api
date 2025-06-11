FROM node:20 AS base
WORKDIR /usr/src/app

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY tsconfig*.json nest-cli.json ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /usr/src/app
COPY src/ ./src/
RUN npm run build
RUN ls -la dist/

FROM node:20-alpine AS production
WORKDIR /usr/src/app

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/dist ./dist
COPY tsconfig*.json nest-cli.json ./

RUN pnpm install --prod --frozen-lockfile

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]