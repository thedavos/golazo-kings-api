# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install PNPM
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Development stage
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Install PNPM
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev dependencies)
ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose application port
EXPOSE 3000

# Start app in development mode (with hot-reload)
CMD ["pnpm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install PNPM
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]