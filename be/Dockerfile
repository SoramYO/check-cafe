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
    npm ci --omit=dev && npm cache clean --force; \
  else \
    npm install --only=production && npm cache clean --force; \
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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# Start the application
CMD ["npm", "start"] 