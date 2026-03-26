# ============================================================================
# MeiLearning Frontend — Multi-stage Docker Build
# ============================================================================

# ── Stage 1: Build ─────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build arg for Vite env vars (baked in at build time)
ARG VITE_API_BASE_URL=/api/v1

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ── Stage 2: Serve with Caddy ──────────────────────────────────────
FROM caddy:alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /srv

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
