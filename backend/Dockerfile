FROM node:18-alpine

# Install security updates and dumb-init
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs . .

# Build TypeScript and generate Prisma client
RUN npx tsc && npx prisma generate

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Expose port
EXPOSE 3000

# Start the application with dumb-init
CMD ["dumb-init", "node", "dist/server.js"]