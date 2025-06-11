#-----------------------------------------
# Stage 1: Base - Installs dependencies and prepares common tools
#-----------------------------------------
FROM node:20 AS base
WORKDIR /usr/src/app

# Install PNPM using corepack (recommended for Node >= 16.10)
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Copy configuration files needed for build
COPY tsconfig*.json nest-cli.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

#-----------------------------------------
# Stage 2: Builder - Creates the production build
#-----------------------------------------
FROM base AS builder
WORKDIR /usr/src/app

# Copy source code
COPY src/ ./src/

# Run the build command
RUN npm run build

# Verify the build output exists
RUN ls -la dist/

#-----------------------------------------
# Stage 3: Production - Final lean image
#-----------------------------------------
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Install PNPM using corepack
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy the compiled application
COPY --from=builder /usr/src/app/dist ./dist

# Copy configuration files needed for runtime
COPY tsconfig*.json nest-cli.json ./

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Set non-root user
USER node

# Expose the application port
EXPOSE 3000

# Default command to run the production application
CMD ["node", "dist/main.js"]

#-----------------------------------------
# Stage 4: Development - For local development environment
#-----------------------------------------
FROM base AS development

WORKDIR /usr/src/app

# Copy source code for development
COPY . .

ENV NODE_ENV=development

# Default command for development (e.g., with hot-reloading)
CMD ["npm", "run", "start:dev"]