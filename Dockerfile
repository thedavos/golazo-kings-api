# --------------> Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Add build essentials for packages that may need compilation
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY package*.json ./

# Set common environment variables
ENV NODE_ENV=production
ENV TZ=UTC

# --------------> Development stage
FROM base AS development
# Override NODE_ENV for development
ENV NODE_ENV=development

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code and config files
COPY . .

# Build the application
RUN npm run build

# Start in development mode by default
CMD ["npm", "run", "start:dev"]

# --------------> Production stage
FROM base AS production
# Ensure NODE_ENV is production
ENV NODE_ENV=production

# Copy built application from development stage
COPY --from=development /app/dist ./dist

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

# Switch to non-root user for security
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q --spider http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]