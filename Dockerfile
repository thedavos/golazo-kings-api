# BASE STAGE
FROM node:20 AS base

# Create app directory
WORKDIR /usr/src/app

# Install PNPM globally
# Install PNPM
RUN npm install -g pnpm

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY pnpm-*.yaml* ./

# Install app dependencies
RUN pnpm install --frozen-lockfile

# Bundle app source
COPY . .

# Copy the entrypoint script
COPY --chown=node:node entrypoint.sh /usr/local/bin/

# Make the entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Creates a "dist" folder with the production build
RUN npm run build


# DEVELOPMENT STAGE
FROM base AS development

ENV NODE_ENV=development

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]

CMD ["npm", "run", "start:dev"]

# PRODUCTION STAGE
FROM base AS production

ENV NODE_ENV=production

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
