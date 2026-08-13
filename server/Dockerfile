# ==========================================
# Multi-stage Dockerfile for NestJS Application
# Optimized for production deployment on Railway
# ==========================================

# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies (for native modules like bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and config files
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Build the application
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# ==========================================
# Stage 2: Production Stage
# ==========================================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install runtime dependencies for native modules
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Copy production node_modules from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Set NODE_ENV to production
ENV NODE_ENV=production

# Switch to non-root user
USER nestjs

# Expose the port (Railway will override with PORT env var)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
