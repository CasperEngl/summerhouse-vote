# Build stage
FROM oven/bun:latest AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (including dev dependencies for building)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Production stage
FROM oven/bun:latest AS runtime

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production && \
    # Clean up cache to reduce image size
    rm -rf ~/.bun/install/cache

# Copy built application from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Create data directory for SQLite database
RUN mkdir -p data

# Expose port 3000
EXPOSE 3000

# Health check using Bun's fetch
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun --bun -e "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1))"

# Run database migrations and seed, then start the server
CMD bun --bun src/seed.ts && bun start
