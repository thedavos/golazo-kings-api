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

# Install ALL dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

#-----------------------------------------
# Stage 2: Builder - Creates the production build
#-----------------------------------------
FROM base AS builder
WORKDIR /usr/src/app

# Run the build command
RUN npm run build
# Optional: Prune dev dependencies AFTER build if needed elsewhere,
# but we'll reinstall prod deps cleanly in the final stage.
# RUN pnpm prune --prod

#-----------------------------------------
# Stage 3: Production - Final lean image
#-----------------------------------------
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Install PNPM using corepack
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/dist ./dist

# Copy entrypoint script and set ownership/permissions
COPY --chown=node:node scripts/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Set non-root user
USER node

# Expose the application port
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]

# Default command to run the production application
CMD ["node", "dist/main.js"]

#-----------------------------------------
# Stage 4: Development - For local development environment
#-----------------------------------------
FROM base AS development

WORKDIR /usr/src/app

ENV NODE_ENV=development

# Copy entrypoint script and set ownership/permissions
# (Needs to be copied again as this stage starts from 'base')
COPY --chown=node:node scripts/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set non-root user (optional for dev, but good practice)
# USER node # Uncomment if needed/desired for dev

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]

# Default command for development (e.g., with hot-reloading)
CMD ["npm", "run", "start:dev"]