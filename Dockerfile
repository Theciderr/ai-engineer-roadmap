# --- deps & build ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# better-sqlite3 needs build tools to compile its native binding.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# --- runtime ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/data ./data
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Data directory holds mission-control.db - mount a volume here in production
# so completed tasks and job applications survive container restarts.
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["npm", "start"]
