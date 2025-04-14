# BASE STAGE
FROM node:23-alpine AS base
WORKDIR /app
COPY package*.json ./


# DEVELOPMENT STAGE
FROM base AS development
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start:dev"]

# PRODUCTION STAGE
FROM base AS production
RUN npm ci --only=production
COPY --from=development /app/dist ./dist
CMD ["node", "dist/main"]