FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

FROM oven/bun:latest AS runtime

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production && \
    rm -rf ~/.bun/install/cache

COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./

RUN mkdir -p data

EXPOSE 3000

CMD bun --bun src/seed.ts && bun --bun start
