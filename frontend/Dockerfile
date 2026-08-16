FROM node:20-alpine AS base
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps

# ─── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
COPY package*.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps
COPY . .
# Copy production env for build
COPY .env.production .env.local
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Runner ───────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
