# --------------> Base stage
FROM node:20-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Add build essentials for packages that may need compilation
RUN apk add --no-cache python3 make g++ git

# A wildcard is used to ensure both package.json AND package-lock.json are copied
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

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
