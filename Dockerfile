# --------------> Base stage
FROM node:20-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Add build essentials for packages that may need compilation
RUN apk add --no-cache python3 make g++ git

# Install PNPM globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Set common environment variables
ENV NODE_ENV=production
ENV TZ=UTC
ENV PNPM_HOME="/usr/src/app/.pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# --------------> Development stage
FROM base AS development
# Override NODE_ENV for development
ENV NODE_ENV=development

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

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

# Install app dependencies
RUN pnpm install --frozen-lockfile --prod

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Copy only the necessary files
# 1. First, copy the built application from the development stage
COPY --from=development /usr/src/app/dist ./dist
# 2. Copy other necessary runtime files
COPY --from=development /usr/src/app/nest-cli.json .
COPY --from=development /usr/src/app/tsconfig*.json ./

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["node", "dist/main"]
