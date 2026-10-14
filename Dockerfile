# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./

RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose default application port
EXPOSE 5000

# Set non-root user for security best practices
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the Express server
CMD ["node", "src/server.js"]
