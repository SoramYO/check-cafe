# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies required for building
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies (handle missing lock file gracefully)
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 && \
      npm cache clean --force; \
    else \
      npm install --only=production --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 && \
      npm cache clean --force; \
    fi

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 checkafe

# Change ownership of the app directory
RUN chown -R checkafe:nodejs /app
USER checkafe

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 