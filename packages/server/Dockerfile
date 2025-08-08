# ===========================================
# GeoTIFF Processing API Server - Production Build
# ===========================================

FROM node:20-alpine AS base
WORKDIR /app

# Install GDAL and other system dependencies
RUN apk add --no-cache \
    gdal \
    gdal-dev \
    proj \
    proj-dev \
    geos \
    geos-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# ===========================================
# Dependencies Stage
# ===========================================
FROM base AS deps
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
RUN npm ci --only=production && npm cache clean --force

# ===========================================
# Build Stage
# ===========================================
FROM base AS builder
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
RUN npm ci
COPY packages/server ./packages/server
WORKDIR /app/packages/server
RUN npm run build

# ===========================================
# Production Stage
# ===========================================
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/dist ./dist
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/package.json ./

# Create temp directory for processing
RUN mkdir -p /tmp/geotiff-processing && chown nestjs:nodejs /tmp/geotiff-processing

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/v1/health/simple', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/main.js"]